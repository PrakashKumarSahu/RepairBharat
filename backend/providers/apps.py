from django.apps import AppConfig


class ProvidersConfig(AppConfig):
    """Configuration for the providers app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'providers'
    
    def ready(self):
        """Import signals when app is ready."""
        import providers.signals  # noqa
