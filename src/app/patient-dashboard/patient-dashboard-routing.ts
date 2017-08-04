import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientInfoComponent } from './patient-info/patient-info.component';
import { PatientEncountersComponent } from './patient-encounters/patient-encounters.component';
import { PatientDashboardComponent } from './patient-dashboard.component';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { PatientDashboardGuard } from './patient-dashboard.guard';
import { PatientVitalsComponent } from './patient-vitals/patient-vitals.component';
import { FormsComponent } from './forms/forms.component';
import { LabDataSummaryComponent } from './lab-data-summary/lab-data-summary.component';
import { LabOrdersComponent } from './lab-orders/lab-orders.component';
import { PatientOrdersComponent } from './patient-orders/patient-orders.component';
import { HivSummaryComponent } from './hiv-summary/hiv-summary.component';
import { ProgramsComponent } from './programs/programs.component';
import { ClinicalNotesComponent } from './clinical-notes/clinical-notes.component';
import { VisitComponent } from './visit/visit.component';
import { FormentryComponent } from './formentry/formentry.component';
import { PatientMonthlyStatusComponent } from
  './patient-status-change/patient-monthly-status.component';
import { FromentryGuard } from './formentry/formentry.guard';
import { FormCreationDataResolverService } from './formentry/form-creation-data-resolver.service';
import { HivPatientClinicalSummaryComponent }
  from './patient-clinical-summaries/hiv-patient-clinical-summary.component';
import { LocatorMapComponent } from './locator-map/locator-map.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { VisitEncountersComponent } from './visit-encounters/visit-encounters.component';

const patientDashboardRoutes: Routes = [

  { path: 'patient-search', component: PatientSearchComponent },
  {
    path: ':patient_uuid',
    component: PatientDashboardComponent,
    children: [
      { path: 'general/landing-page', component: LandingPageComponent },
      {
        path: '781d85b0-1359-11df-a1f1-0026b9348838/landing-page',  // HIV Program Landing Page
        component: HivSummaryComponent
      },
      {
        path: '725b5193-3452-43fc-aca3-6a80432d9bfa/landing-page', // Oncology Program Landing Page
        component: PatientInfoComponent
      },
      {
        path: '781d897a-1359-11df-a1f1-0026b9348838/landing-page', // PMTCT Program Landing Page
        component: PatientInfoComponent
      },
      {
        path: '781d8768-1359-11df-a1f1-0026b9348838/landing-page', // OVC Program Landing Page
        component: PatientInfoComponent
      },
      {
        path: '781d8a88-1359-11df-a1f1-0026b9348838/landing-page', // BSG Landing Page
        component: PatientInfoComponent
      },
      {
        path: 'fc15ac01-5381-4854-bf5e-917c907aa77f/landing-page', // CDM Landing Page
        component: PatientInfoComponent
      },
      { path: ':program', redirectTo: ':program/landing-page', pathMatch: 'full' },
      { path: ':program/patient-info', component: PatientInfoComponent },
      { path: ':program/patient-encounters', component: VisitEncountersComponent },
      { path: ':program/patient-vitals', component: PatientVitalsComponent },
      { path: ':program/forms', component: FormsComponent },
      {
        path: ':program/formentry/:formUuid',
        component: FormentryComponent,
        canDeactivate: [FromentryGuard],
        resolve: {
          compiledSchemaWithEncounter: FormCreationDataResolverService
        }
      },
      { path: ':program/hiv-summary', component: HivSummaryComponent },
      { path: ':program/patient-monthly-status-history', component: PatientMonthlyStatusComponent },
      { path: ':program/lab-data-summary', component: LabDataSummaryComponent },
      { path: ':program/lab-orders', component: LabOrdersComponent },
      { path: ':program/patient-orders', component: PatientOrdersComponent },
      { path: 'general/landing-page', component: ProgramsComponent },
      { path: ':program/programs', component: ProgramsComponent },
      { path: ':program/clinical-notes', component: ClinicalNotesComponent },
      { path: ':program/visit', component: VisitComponent },
      { path: ':program/locator-map', component: LocatorMapComponent },
    ],
    canActivate: [
      PatientDashboardGuard
    ],
    canDeactivate: [
      PatientDashboardGuard
    ]
  }
];
export const patientDashboardRouting: ModuleWithProviders = RouterModule
  .forChild(patientDashboardRoutes);
