import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('providers', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.RenameField(
                    model_name='provider',
                    old_name='user',
                    new_name='owner',
                ),
                migrations.AlterField(
                    model_name='provider',
                    name='owner',
                    field=models.OneToOneField(
                        db_column='user_id',
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='owned_provider',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name='Technician',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('specialization', models.CharField(blank=True, default='', max_length=255)),
                ('years_of_experience', models.IntegerField(default=0)),
                ('is_available', models.BooleanField(default=True)),
                ('profile_image', models.URLField(blank=True, default='')),
                ('skill_tags', models.JSONField(blank=True, default=list)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='technicians', to='providers.provider')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='technician_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['user__first_name', 'user__last_name'],
            },
        ),
        migrations.AddIndex(
            model_name='technician',
            index=models.Index(fields=['provider', 'is_active'], name='providers_t_provide_0b0f95_idx'),
        ),
        migrations.AddIndex(
            model_name='technician',
            index=models.Index(fields=['is_available'], name='providers_t_is_avai_31ca6a_idx'),
        ),
    ]
