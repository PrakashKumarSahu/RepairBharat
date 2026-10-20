import logging
import requests
from django.conf import settings
from .models import Notification

logger = logging.getLogger(__name__)


def send_repair_status_notification(repair_order, new_stage_name: str) -> None:
    """Send in-app + optional SMS notification when repair status changes."""
    customer = repair_order.customer
    ticket_number = repair_order.ticket_number
    device_name = f"{repair_order.device.brand} {repair_order.device.model}" if repair_order.device else 'your device'

    title = f"Repair Update: {ticket_number}"
    body = (
        f"Your repair for {device_name} (Ticket: {ticket_number}) "
        f"has moved to stage: {new_stage_name}. "
        f"Track at https://quikx.live"
    )

    # Create in-app notification
    notif = Notification.objects.create(
        recipient=customer,
        notification_type=Notification.Types.IN_APP,
        title=title,
        body=body,
        metadata={'ticket_number': ticket_number, 'stage': new_stage_name},
    )

    # Attempt SMS via Fast2SMS if API key is configured
    api_key = getattr(settings, 'FAST2SMS_API_KEY', None)
    phone = getattr(customer, 'phone', None)
    if api_key and phone:
        try:
            resp = requests.post(
                'https://www.fast2sms.com/dev/bulkV2',
                headers={'authorization': api_key, 'Content-Type': 'application/json'},
                json={
                    'route': 'q',
                    'message': body,
                    'language': 'english',
                    'flash': 0,
                    'numbers': phone,
                },
                timeout=5,
            )
            if resp.status_code == 200 and resp.json().get('return'):
                Notification.objects.create(
                    recipient=customer,
                    notification_type=Notification.Types.SMS,
                    title=title,
                    body=body,
                    status=Notification.Statuses.SENT,
                    metadata={'ticket_number': ticket_number, 'stage': new_stage_name, 'phone': phone},
                )
            else:
                logger.warning('Fast2SMS returned non-success: %s', resp.text)
        except Exception as exc:
            logger.error('Fast2SMS error: %s', exc)
    else:
        if not api_key:
            logger.info('FAST2SMS_API_KEY not set — skipping SMS for ticket %s', ticket_number)
