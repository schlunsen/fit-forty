from django.core.management.base import BaseCommand
from workouts.models import Exercise

class Command(BaseCommand):
    help = 'Creates sample exercises for the workout app'

    def handle(self, *args, **options):
        exercises = [
            # Bodyweight exercises
            {
                'name': 'Push-up',
                'description': 'Classic bodyweight exercise that works the chest, shoulders, and triceps.',
                'muscles_targeted': 'Chest',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=IODxDxX7oi4',
            },
            {
                'name': 'Bodyweight Squat',
                'description': 'Fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=aclHkVaku9U',
            },
            {
                'name': 'Plank',
                'description': 'Core strengthening isometric exercise that builds endurance in the abdominals and shoulders.',
                'muscles_targeted': 'Core',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
            },
            {
                'name': 'Mountain Climber',
                'description': 'Dynamic exercise that works multiple muscle groups while increasing heart rate for cardio benefits.',
                'muscles_targeted': 'Full Body',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=nmwgirgXLYM',
            },
            {
                'name': 'Burpee',
                'description': 'High-intensity full body exercise that combines a squat, push-up, and jump for cardio and strength.',
                'muscles_targeted': 'Full Body',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
            },
            {
                'name': 'Lunge',
                'description': 'Single-leg exercise that strengthens the quadriceps, hamstrings, and glutes while improving balance.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
            },
            {
                'name': 'Pull-up',
                'description': 'Upper body compound exercise that targets the back, shoulders, and arms.',
                'muscles_targeted': 'Back',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
            },
            {
                'name': 'Dip',
                'description': 'Upper body exercise that targets the triceps, chest, and shoulders.',
                'muscles_targeted': 'Triceps',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=2z8JmcrW-As',
            },
            {
                'name': 'Russian Twist',
                'description': 'Rotational exercise that targets the obliques and deep core muscles.',
                'muscles_targeted': 'Core',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=wkD8rjkodUI',
            },
            {
                'name': 'Bicycle Crunch',
                'description': 'Dynamic core exercise that works the rectus abdominis and obliques.',
                'muscles_targeted': 'Core',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=9FGilxCbdz8',
            },
            
            # Dumbbell exercises
            {
                'name': 'Dumbbell Bench Press',
                'description': 'Upper body exercise that targets the chest, shoulders, and triceps using dumbbells.',
                'muscles_targeted': 'Chest',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=QsYre__-aro',
            },
            {
                'name': 'Dumbbell Row',
                'description': 'Back exercise that targets the latissimus dorsi, rhomboids, and biceps.',
                'muscles_targeted': 'Back',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=roCP6wCXPqo',
            },
            {
                'name': 'Dumbbell Shoulder Press',
                'description': 'Overhead pressing movement that targets the deltoids and triceps.',
                'muscles_targeted': 'Shoulders',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=qEwKCR5JCog',
            },
            {
                'name': 'Dumbbell Goblet Squat',
                'description': 'Lower body exercise holding a dumbbell that targets the quadriceps, hamstrings, and glutes.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
            },
            {
                'name': 'Dumbbell Bicep Curl',
                'description': 'Isolation exercise that targets the biceps brachii.',
                'muscles_targeted': 'Arms',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
            },
            {
                'name': 'Dumbbell Tricep Extension',
                'description': 'Isolation exercise that targets the triceps brachii.',
                'muscles_targeted': 'Arms',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=_gsUck-7M74',
            },
            {
                'name': 'Dumbbell Lateral Raise',
                'description': 'Isolation exercise that targets the lateral deltoids.',
                'muscles_targeted': 'Shoulders',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
            },
            {
                'name': 'Dumbbell Lunge',
                'description': 'Single-leg exercise with dumbbells that works the quadriceps, hamstrings, and glutes.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'DB',
                'video_url': 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
            },
            
            # Kettlebell exercises
            {
                'name': 'Kettlebell Swing',
                'description': 'Dynamic exercise that targets the posterior chain, including the hamstrings, glutes, and lower back.',
                'muscles_targeted': 'Full Body',
                'equipment_type': 'KB',
                'video_url': 'https://www.youtube.com/watch?v=Buz6gaVzVZs',
            },
            {
                'name': 'Kettlebell Turkish Get-Up',
                'description': 'Complex movement that improves stability, coordination, and strength throughout the entire body.',
                'muscles_targeted': 'Full Body',
                'equipment_type': 'KB',
                'video_url': 'https://www.youtube.com/watch?v=2YollP91Wro',
            },
            {
                'name': 'Kettlebell Goblet Squat',
                'description': 'Lower body exercise holding a kettlebell that targets the quadriceps, hamstrings, and glutes.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'KB',
                'video_url': 'https://www.youtube.com/watch?v=QrVgpDOLlgM',
            },
            {
                'name': 'Kettlebell Clean and Press',
                'description': 'Compound exercise that combines a clean and a press to work the full body.',
                'muscles_targeted': 'Full Body',
                'equipment_type': 'KB',
                'video_url': 'https://www.youtube.com/watch?v=ZuTHlxwRdgE',
            },
            
            # Resistance Band exercises
            {
                'name': 'Resistance Band Pull-Apart',
                'description': 'Upper back exercise that targets the rear deltoids, rhomboids, and middle trapezius.',
                'muscles_targeted': 'Back',
                'equipment_type': 'OT',
                'video_url': 'https://www.youtube.com/watch?v=taMfwDxEBzA',
            },
            {
                'name': 'Resistance Band Bicep Curl',
                'description': 'Arm exercise using bands that targets the biceps.',
                'muscles_targeted': 'Arms',
                'equipment_type': 'OT',
                'video_url': 'https://www.youtube.com/watch?v=nNOyA_s-sbs',
            },
            {
                'name': 'Resistance Band Lateral Walk',
                'description': 'Lower body exercise that targets the hip abductors and glutes.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'OT',
                'video_url': 'https://www.youtube.com/watch?v=nS83LzitrfM',
            },
            
            # Stretching & Mobility
            {
                'name': 'Hip Flexor Stretch',
                'description': 'Static stretch that targets the hip flexors to improve hip mobility.',
                'muscles_targeted': 'Hips',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=7bRaX6M2nr8',
            },
            {
                'name': 'Shoulder Mobility Drill',
                'description': 'Dynamic movement to improve shoulder range of motion and prevent injury.',
                'muscles_targeted': 'Shoulders',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=3g95hw8Xrd8',
            },
            {
                'name': 'Hamstring Stretch',
                'description': 'Static stretch that targets the hamstrings to improve flexibility and prevent injury.',
                'muscles_targeted': 'Legs',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=FDwpEdxZ4H4',
            },
            
            # Cardio
            {
                'name': 'Jumping Jacks',
                'description': 'Full body cardio exercise that elevates heart rate and improves coordination.',
                'muscles_targeted': 'Cardio',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
            },
            {
                'name': 'High Knees',
                'description': 'Dynamic cardio exercise that targets the lower body while elevating heart rate.',
                'muscles_targeted': 'Cardio',
                'equipment_type': 'BW',
                'video_url': 'https://www.youtube.com/watch?v=tx5rgpd5p_M',
            },
        ]

        created_count = 0
        for exercise_data in exercises:
            _, created = Exercise.objects.get_or_create(
                name=exercise_data['name'],
                defaults=exercise_data
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} sample exercises'))