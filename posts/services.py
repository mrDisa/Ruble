from users.models import User
from django.db.models import F

def update_user_rank(user):
    user_annotated = User.objects.with_rank_score().get(id=user.id)
    score = user_annotated.calculated_rank_score

    user.rank_score = score
    user.rank = user_annotated.calculate_rank()

    user.save(update_fields=["rank_score", "rank"])