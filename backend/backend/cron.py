# myapp/cron.py
from django_cron import CronJobBase, Schedule
from django.utils import timezone
from todo.models import Task

class MyCronJob(CronJobBase):
    RUN_EVERY_MINS = 1
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'backend.my_cron_job' 

    def do(self):
        print("Cron job is running")
        Task.objects.filter(status="ongoing", deadline__lt=timezone.now()).update(status="failure")
