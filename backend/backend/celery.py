import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Find all tasks
app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

# Optimization settings
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,

    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=50,

    task_soft_time_limit=300,
    task_time_limit=600,

    task_routes={
        'ads.task.process_image_watermark': {'queue': 'image_processing'},
        'ads.tasks.bulk_process_images': {'queue': 'image_processing'},
    },

    task_track_started=True,
    task_send_sent_event=True,
)


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
