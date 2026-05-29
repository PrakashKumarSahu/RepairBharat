import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RepairBharat.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import CustomUser, CustomerProfile, ShopOwnerProfile, TechnicianProfile
from organizations.models import Organization, Branch
from providers.models import Skill, Technician
from devices.models import Device
from workflow.models import WorkflowStage
from repairs.models import RepairOrder
from inventory.models import InventoryItem
from billing.models import GSTInvoice

User = get_user_model()

def seed():
    print("Beginning scaled database seeding...")
    
    # 0. Clear existing data in exact dependency order to allow re-seeding cleanly
    try:
        from workshop.models import RepairTicket, Branch as OldBranch
        GSTInvoice.objects.all().delete()
        InventoryItem.objects.all().delete()
        RepairOrder.objects.all().delete()
        RepairTicket.objects.all().delete()
        OldBranch.objects.all().delete()
    except Exception:
        pass

    try:
        Branch.objects.all().delete()
        Organization.objects.all().delete()
        Skill.objects.all().delete()
        WorkflowStage.objects.all().delete()
        User.objects.filter(username__in=["owner1", "tech1", "customer1"]).delete()
    except Exception:
        pass
    
    # 1. Create standard Kanban workflow pipeline stages
    stages = [
        {"code": "received", "name": "Received", "order": 1, "color_hex": "#7c6cff"},
        {"code": "diagnosing", "name": "Under Diagnosis", "order": 2, "color_hex": "#3b82f6"},
        {"code": "waiting_approval", "name": "Awaiting Estimate Approval", "order": 3, "color_hex": "#ffb86b"},
        {"code": "in_repair", "name": "Repair in Progress", "order": 4, "color_hex": "#8b5cf6"},
        {"code": "testing", "name": "Quality Testing", "order": 5, "color_hex": "#14b8a6"},
        {"code": "ready", "name": "Ready for Pickup", "order": 6, "color_hex": "#28d7c8"},
        {"code": "delivered", "name": "Handed Over & Delivered", "order": 7, "color_hex": "#10b981"},
        {"code": "cancelled", "name": "Cancelled", "order": 8, "color_hex": "#ff6f91"},
    ]
    stage_objs = {}
    for st in stages:
        obj = WorkflowStage.objects.create(**st)
        stage_objs[st["code"]] = obj
    print(f"Registered {len(stage_objs)} workflow pipeline stages.")

    # 2. Register basic repair capabilities (Skills)
    skills = [
        {"name": "OLED Display Assembly Replacement", "description": "Precision alignment and optical adhesive bonding"},
        {"name": "Motherboard Micro-soldering", "description": "SMD capacitor and IC level servicing under magnification"},
        {"name": "SLA & Battery Diagnostics", "description": "Capacity logs, cycle profiling, and secure replacements"},
        {"name": "Water Damage Treatment", "description": "Ultrasonic bath and corrosion mitigation"},
    ]
    skill_objs = []
    for sk in skills:
        obj = Skill.objects.create(**sk)
        skill_objs.append(obj)
    print(f"Created {len(skill_objs)} technical skill categories.")

    # 3. Create core user profiles
    # Shop Owner
    owner_user = User.objects.create(
        username="owner1",
        email="owner1@repairbharat.in",
        phone="9876543210",
        address="123 Business Park, Mumbai",
        role=CustomUser.Roles.SHOP_OWNER
    )
    owner_user.set_password("password123")
    owner_user.save()
    print("Seeded shop owner user: owner1")
    
    owner_profile = owner_user.shop_owner_profile
    owner_profile.shop_name = "RepairBharat Premium Care Group"
    owner_profile.shop_address = "Mumbai Corporate Head Office"
    owner_profile.gst_number = "27AAAAA1111A1Z1"
    owner_profile.save()

    # Technician
    tech_user = User.objects.create(
        username="tech1",
        email="tech1@repairbharat.in",
        phone="9876543211",
        address="456 Staff Quarter, Mumbai",
        role=CustomUser.Roles.TECHNICIAN
    )
    tech_user.set_password("password123")
    tech_user.save()
    print("Seeded technician user: tech1")
    
    # Customer
    cust_user = User.objects.create(
        username="customer1",
        email="customer1@gmail.com",
        phone="9876543212",
        address="789 Residential Apt, Bandra, Mumbai",
        role=CustomUser.Roles.CUSTOMER
    )
    cust_user.set_password("password123")
    cust_user.save()
    print("Seeded customer user: customer1")

    # 4. Create Multi-Tenant Organizations & Decoupled Branches
    org = Organization.objects.create(
        owner=owner_profile,
        name="RepairBharat Corporate Holdings",
        gst_number="27AAAAA1111A1Z1"
    )
    
    branches = [
        {"name": "RepairBharat Connaught Place", "city": "Delhi", "address": "Block E, Connaught Place, New Delhi", "specialties": "Mobiles, Laptops, Apple Specialists", "phone": "9111111111", "rating": 4.8},
        {"name": "RepairBharat Bandra West", "city": "Mumbai", "address": "Linking Road, Bandra West, Mumbai", "specialties": "Mobiles, Laptops, Tablets, Micro-soldering", "phone": "9222222222", "rating": 4.9},
        {"name": "RepairBharat Indiranagar", "city": "Bengaluru", "address": "100 Feet Road, Indiranagar, Bengaluru", "specialties": "Mobiles, Laptops, Smartwatches, Audio Repairs", "phone": "9333333333", "rating": 4.7},
    ]
    branch_objs = []
    for b in branches:
        obj = Branch.objects.create(
            organization=org,
            name=b["name"],
            city=b["city"],
            address=b["address"],
            specialties=b["specialties"],
            phone=b["phone"],
            rating=b["rating"]
        )
        branch_objs.append(obj)
    print(f"Decoupled and created {len(branch_objs)} workspace branches.")

    # 5. Populate technician workstation & link skills
    tech_profile, _ = Technician.objects.get_or_create(user=tech_user)
    tech_profile.experience_years = 5
    tech_profile.is_verified = True
    tech_profile.shop = owner_profile
    tech_profile.branch = branch_objs[1] # Assigned to Bandra branch
    tech_profile.save()
    tech_profile.skills.add(skill_objs[0], skill_objs[1], skill_objs[2])
    print(f"Configured high-fidelity technician worksheet profile for {tech_user.username}.")

    # 6. Populate customer hardware devices
    devices = [
        {"category": "Smartphone", "brand": "Apple", "model": "iPhone 13 Pro", "serial_number_or_imei": "IMEI-889988998"},
        {"category": "Laptop", "brand": "Dell", "model": "XPS 13", "serial_number_or_imei": "SN-DELLXPS13"},
    ]
    device_objs = []
    for d in devices:
        obj = Device.objects.create(
            customer=cust_user,
            category=d["category"],
            brand=d["brand"],
            model=d["model"],
            serial_number_or_imei=d["serial_number_or_imei"]
        )
        device_objs.append(obj)
    print(f"Populated {len(device_objs)} structured customer hardware devices.")

    # 7. Seed inventory spares
    mumbai_branch = branch_objs[1]
    spares = [
        {"name": "iPhone 13 Pro OLED Display Panel", "sku": "IPH13P-SCR", "category": "Display", "stock_level": 15, "purchase_price": 5500, "selling_price": 9500, "hsn_code": "85177900"},
        {"name": "Dell XPS 13 Battery Kit", "sku": "DELL-BAT-XPS", "category": "Battery", "stock_level": 3, "purchase_price": 2400, "selling_price": 4800, "hsn_code": "85076000"}, # Low stock warning triggered
        {"name": "USB-C Port Board (Samsung S22)", "sku": "SAM-S22-CHG", "category": "Port", "stock_level": 30, "purchase_price": 180, "selling_price": 750, "hsn_code": "85177900"},
    ]
    for sp in spares:
        InventoryItem.objects.create(
            branch=mumbai_branch,
            name=sp["name"],
            sku=sp["sku"],
            category=sp["category"],
            stock_level=sp["stock_level"],
            low_stock_threshold=5,
            purchase_price=sp["purchase_price"],
            selling_price=sp["selling_price"],
            hsn_code=sp["hsn_code"],
            gst_rate=18.00
        )
    print("Loaded spares stockroom inventory levels.")

    # 8. Seed sample RepairOrders
    RepairOrder.objects.create(
        branch=mumbai_branch,
        customer=cust_user,
        device=device_objs[0],
        assigned_technician=tech_profile,
        issue_reported="Glass completely shattered after drop, touch unresponsive.",
        diagnostics_notes="Needs screen panel swap out. Touch IC intact but display assembly bleeding.",
        status=stage_objs["diagnosing"],
        priority=RepairOrder.Priorities.HIGH,
        estimated_cost=9500.00,
        advance_paid=2000.00
    )
    
    RepairOrder.objects.create(
        branch=mumbai_branch,
        customer=cust_user,
        device=device_objs[1],
        assigned_technician=None,
        issue_reported="Device won't boot up, orange charging LED blinking.",
        diagnostics_notes="",
        status=stage_objs["received"],
        priority=RepairOrder.Priorities.MEDIUM,
        estimated_cost=0.00,
        advance_paid=0.00
    )
    print("Registered sample enterprise repair orders.")
    print("Database seeding completed perfectly! Ready for scaled end-to-end sandbox operations.")

if __name__ == "__main__":
    seed()
