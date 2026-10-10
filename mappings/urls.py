from django.urls import path
from mappings.views import PatientDoctorListCreateView, PatientDoctorPatientOrDeleteView

urlpatterns = [
    path('', PatientDoctorListCreateView.as_view(), name='mapping-list-create'),
    path('<int:pk>/', PatientDoctorPatientOrDeleteView.as_view(), name='mapping-patient-or-delete'),
]
