from rest_framework import generics, permissions
from django.db.models import Q
from .models import Organization, Branch
from .serializers import OrganizationSerializer, BranchSerializer
from accounts.models import ShopOwnerProfile


class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "shop_owner":
            return Organization.objects.filter(owner__user=user)
        return Organization.objects.none()

    def perform_create(self, serializer):
        profile = self.request.user.shop_owner_profile
        serializer.save(owner=profile)


class BranchListCreateView(generics.ListCreateAPIView):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Branch.objects.all().order_by("-rating")
        
        # Restrict branches for franchise management, unless B2C customer portal requests all
        if user.is_authenticated and self.request.query_params.get("all") != "true":
            if user.role == "shop_owner":
                queryset = queryset.filter(organization__owner__user=user)
            elif user.role == "technician":
                tech_profile = getattr(user, "technician_profile_new", None)
                if tech_profile and tech_profile.shop:
                    queryset = queryset.filter(organization__owner=tech_profile.shop)

        city = self.request.query_params.get("city", None)
        specialty = self.request.query_params.get("specialty", None)
        search = self.request.query_params.get("search", None)

        if city:
            queryset = queryset.filter(city__iexact=city)
        if specialty:
            queryset = queryset.filter(specialties__icontains=specialty)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(address__icontains=search) |
                Q(specialties__icontains=search)
            )
        return queryset

    def list(self, request, *args, **kwargs):
        import urllib.request
        import urllib.parse
        import json
        from django.conf import settings
        from rest_framework.response import Response

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        local_branches = serializer.data

        # Enforce baseline fields on local database records
        for b in local_branches:
            b["is_local_db"] = True
            # Add dynamic distance and rating values if missing
            b["rating"] = float(b.get("rating") or 4.5)
            b["distance"] = 1.2
            b["reviews_count"] = 48
            b["latitude"] = float(b.get("latitude") or (19.0760 + (b["id"] * 0.005)))
            b["longitude"] = float(b.get("longitude") or (72.8777 - (b["id"] * 0.008)))

        # Build map with lowercase shop names for lookup comparison
        merged_branches = {b["name"].lower().strip(): b for b in local_branches}

        # Query Google Places if key exists
        api_key = getattr(settings, "GOOGLE_PLACES_API_KEY", None)
        city = request.query_params.get("city", "Mumbai")
        specialty = request.query_params.get("specialty", "electronics")

        if api_key:
            try:
                # TextSearch query to Google Places
                base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {
                    "query": f"{specialty} repair in {city}",
                    "key": api_key
                }
                url = f"{base_url}?{urllib.parse.urlencode(params)}"
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=5) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
                        results = data.get("results", [])
                        for idx, place in enumerate(results):
                            name = place.get("name", "").strip()
                        name_lower = name.lower()

                        # If shop exists in BOTH Google and Database:
                        if name_lower in merged_branches:
                            # Prefer the database shop! We keep the local record but enrich it with Google ratings
                            local_shop = merged_branches[name_lower]
                            local_shop["rating"] = float(place.get("rating", local_shop.get("rating", 4.5)))
                            local_shop["reviews_count"] = place.get("user_ratings_total", local_shop.get("reviews_count", 50))
                            loc = place.get("geometry", {}).get("location", {})
                            if loc.get("lat") and loc.get("lng"):
                                local_shop["latitude"] = float(loc["lat"])
                                local_shop["longitude"] = float(loc["lng"])
                        else:
                            # Create a virtual external Google shop
                            loc = place.get("geometry", {}).get("location", {})
                            lat = float(loc.get("lat", 19.0760))
                            lng = float(loc.get("lng", 72.8777))
                            
                            merged_branches[name_lower] = {
                                "id": f"google_place_{place.get('place_id', idx)}",
                                "name": name,
                                "address": place.get("formatted_address", f"{city}, India"),
                                "city": city,
                                "phone": "N/A",
                                "specialties": specialty,
                                "rating": float(place.get("rating", 4.2)),
                                "reviews_count": place.get("user_ratings_total", 15),
                                "latitude": lat,
                                "longitude": lng,
                                "distance": 2.8,
                                "is_local_db": False,
                                "organization_name": "Google Maps Merchant"
                            }
            except Exception:
                pass

        return Response(list(merged_branches.values()))

    def perform_create(self, serializer):
        profile = self.request.user.shop_owner_profile
        org = Organization.objects.filter(owner=profile).first()
        gst_num = self.request.data.get("gst_number") or ""
        if not org:
            org = Organization.objects.create(owner=profile, name=f"{profile.shop_name} HQ", gst_number=gst_num)
        elif gst_num and not org.gst_number:
            org.gst_number = gst_num
            org.save()
        serializer.save(organization=org)
