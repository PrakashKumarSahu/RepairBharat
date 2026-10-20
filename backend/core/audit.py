import logging
from .models import ActivityLog

logger = logging.getLogger(__name__)


def log_action(user, action: str, resource_type: str, resource_id=None, metadata=None, request=None):
    """Record an audit log entry. Safe to call anywhere — never raises."""
    try:
        ip = None
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded_for.split(',')[0].strip() if x_forwarded_for else request.META.get('REMOTE_ADDR')
        ActivityLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata or {},
            ip_address=ip,
        )
    except Exception as exc:
        logger.error('audit log error: %s', exc)
