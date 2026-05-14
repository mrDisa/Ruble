from django.db import models
from django.db.models import F, FloatField, ExpressionWrapper
from django.db.models.functions import Coalesce, Extract, Now, Ln, Exp


class PostQuerySet(models.QuerySet):
    def with_score(self):
        age_seconds = ExpressionWrapper(
            Extract(Now(), 'epoch') - Extract(F('created_at'), 'epoch'),
            output_field=FloatField()
        )

        age_days = ExpressionWrapper(
            age_seconds / 86400.0,
            output_field=FloatField()
        )

        age_hours = ExpressionWrapper(
            age_seconds / 3600.0,
            output_field=FloatField()
        )

        rating_count = Coalesce(F('rating_count'), 0.0)

        freshness = ExpressionWrapper(
            Exp(-Coalesce(age_days, 0.0) / 7.0),
            output_field=FloatField()
        )

        quality = ExpressionWrapper(
            Ln(Coalesce(F('rating_avg'), 0.0) + 1.0),
            output_field=FloatField()
        )

        velocity = ExpressionWrapper(
            rating_count / (Coalesce(age_hours, 0.0) + 1.0),
            output_field=FloatField()
        )

        score = quality * velocity * freshness

        return self.annotate(
            calculated_score=score,
            age_days=age_days
        )