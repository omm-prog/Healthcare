from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class PatientDoctor(models.Model):
    """
    Model associating a Doctor with a Patient.
    Unique constraint prevents duplicate assignments of the same doctor to the same patient.
    """
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='doctor_mappings',
        verbose_name="Patient"
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='patient_mappings',
        verbose_name="Assigned Doctor"
    )
    assigned_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Assignment Timestamp"
    )

    class Meta:
        verbose_name = 'Patient-Doctor Mapping'
        verbose_name_plural = 'Patient-Doctor Mappings'
        ordering = ['-assigned_at']
        constraints = [
            models.UniqueConstraint(
                fields=['patient', 'doctor'],
                name='unique_patient_doctor_assignment'
            )
        ]

    def __str__(self):
        return f"{self.patient.name} -> Dr. {self.doctor.name}"
