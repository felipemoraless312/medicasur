import type { Patient } from '@/lib/types'

export interface PatientClinicalRecord {
  birthDate: string
  phone: string
  email: string
  address: string
  bloodType: string
  occupation: string
  civilStatus: string
  emergencyContact: { name: string; relationship: string; phone: string }
  diagnosis: string
  diagnosisSince: string
  lastVisit: string
  nextVisit: { date: string; time: string; reason: string }
  medications: { name: string; instructions: string; duration: string; status: string }[]
  history: { medical: string; surgical: string; family: string; habits: string }[]
  vitals: { date: string; weight: string; height: string; bmi: string; bloodPressure: string; heartRate: string; temperature: string; oxygen: string }
  encounters: { date: string; title: string; detail: string; clinician: string }[]
  studies: { date: string; name: string; result: string }[]
  documents: { name: string; detail: string }[]
}

export const patients: Patient[] = [
  { id: '1', name: 'Juan Pérez López', record: 'EXP-000123', age: 45, sex: 'Masculino', status: 'seguimiento', photo: '/demo/patient-1.jpg', allergies: [] },
  { id: '2', name: 'María López García', record: 'EXP-000124', age: 38, sex: 'Femenino', status: 'espera', photo: '/demo/patient-2.jpg', allergies: ['Penicilina'] },
  { id: '3', name: 'Carlos Hernández', record: 'EXP-000119', age: 52, sex: 'Masculino', status: 'activo', photo: '/demo/patient-3.jpg', allergies: [] },
]

export const patientClinicalRecords: Record<string, PatientClinicalRecord> = {
  '1': {
    birthDate: '15 abril 1981', phone: '55 4182 7063', email: 'juan.perez@correo.mx', address: 'Col. Del Valle, Benito Juárez, CDMX',
    bloodType: 'O positivo', occupation: 'Contador', civilStatus: 'Casado',
    emergencyContact: { name: 'Elena López', relationship: 'Cónyuge', phone: '55 4182 7064' },
    diagnosis: 'Enfermedad por reflujo gastroesofágico', diagnosisSince: '2024', lastVisit: '27 septiembre 2026',
    nextVisit: { date: '23 noviembre 2026', time: '10:00', reason: 'Control de síntomas' },
    medications: [{ name: 'Omeprazol 20 mg', instructions: '1 cápsula por vía oral cada 24 horas, antes del desayuno', duration: '8 semanas · indicada el 27 sep. 2026', status: 'Vigente' }],
    history: [{ medical: 'ERGE desde 2024. Niega diabetes e hipertensión.', surgical: 'Apendicectomía (2010), sin complicaciones.', family: 'Madre con diabetes tipo 2; padre con hipertensión.', habits: 'No fuma. Alcohol ocasional. Actividad física 2 veces por semana.' }],
    vitals: { date: '27 septiembre 2026', weight: '78 kg', height: '1.74 m', bmi: '25.8', bloodPressure: '128/82 mmHg', heartRate: '74 lpm', temperature: '36.6 °C', oxygen: '98%' },
    encounters: [
      { date: '27 septiembre 2026', title: 'Consulta de seguimiento', detail: 'Pirosis ocasional con mejoría parcial. Se refuerzan medidas higiénico-dietéticas y se indica continuar tratamiento.', clinician: 'Dr. Francisco Ramos' },
      { date: '16 agosto 2026', title: 'Consulta inicial', detail: 'Pirosis y regurgitación de tres meses de evolución, sin datos de alarma referidos.', clinician: 'Dr. Francisco Ramos' },
      { date: '04 agosto 2026', title: 'Estudio recibido', detail: 'Reporte de laboratorio incorporado al expediente para revisión clínica.', clinician: 'Laboratorio externo' },
    ],
    studies: [{ date: '04 agosto 2026', name: 'Biometría hemática', result: 'Reporte recibido · revisado' }, { date: '04 agosto 2026', name: 'Química sanguínea', result: 'Reporte recibido · revisado' }],
    documents: [{ name: 'Laboratorios_agosto_2026.pdf', detail: 'PDF · 04 ago. 2026' }, { name: 'Consentimiento_informado.pdf', detail: 'PDF · 16 ago. 2026' }],
  },
  '2': {
    birthDate: '09 febrero 1988', phone: '55 2901 6450', email: 'maria.lopez@correo.mx', address: 'Col. Narvarte, Benito Juárez, CDMX',
    bloodType: 'A positivo', occupation: 'Docente', civilStatus: 'Soltera',
    emergencyContact: { name: 'Rosa García', relationship: 'Madre', phone: '55 2901 6451' },
    diagnosis: 'Dispepsia en valoración', diagnosisSince: '2026', lastVisit: '25 septiembre 2026',
    nextVisit: { date: '09 octubre 2026', time: '12:00', reason: 'Revisión de estudios' },
    medications: [{ name: 'Butilhioscina 10 mg', instructions: '1 tableta por vía oral cada 8 horas si presenta cólico', duration: 'Según necesidad · indicada el 25 sep. 2026', status: 'Temporal' }],
    history: [{ medical: 'Dispepsia en estudio. Alergia a penicilina (urticaria).', surgical: 'Niega antecedentes quirúrgicos.', family: 'Padre con gastritis crónica.', habits: 'No fuma. No refiere consumo habitual de alcohol. Caminata ocasional.' }],
    vitals: { date: '25 septiembre 2026', weight: '62 kg', height: '1.62 m', bmi: '23.6', bloodPressure: '116/74 mmHg', heartRate: '78 lpm', temperature: '36.7 °C', oxygen: '99%' },
    encounters: [{ date: '25 septiembre 2026', title: 'Valoración inicial', detail: 'Dolor epigástrico intermitente. Se solicitan estudios de laboratorio y se documenta alergia a penicilina.', clinician: 'Dr. Francisco Ramos' }],
    studies: [{ date: '25 septiembre 2026', name: 'Perfil hepático', result: 'Pendiente de toma' }],
    documents: [{ name: 'Solicitud_estudios.pdf', detail: 'PDF · 25 sep. 2026' }],
  },
  '3': {
    birthDate: '22 junio 1974', phone: '55 3670 1182', email: 'carlos.hernandez@correo.mx', address: 'Col. Roma Sur, Cuauhtémoc, CDMX',
    bloodType: 'B positivo', occupation: 'Comerciante', civilStatus: 'Casado',
    emergencyContact: { name: 'Marta Hernández', relationship: 'Cónyuge', phone: '55 3670 1183' },
    diagnosis: 'Gastritis crónica en seguimiento', diagnosisSince: '2023', lastVisit: '18 septiembre 2026',
    nextVisit: { date: '16 octubre 2026', time: '09:00', reason: 'Seguimiento clínico' },
    medications: [{ name: 'Pantoprazol 40 mg', instructions: '1 tableta por vía oral cada 24 horas, antes del desayuno', duration: '4 semanas · indicada el 18 sep. 2026', status: 'Vigente' }],
    history: [{ medical: 'Gastritis crónica desde 2023. Hipertensión controlada.', surgical: 'Colecistectomía laparoscópica (2018).', family: 'Madre con hipertensión arterial.', habits: 'Exfumador desde 2020. Alcohol ocasional.' }],
    vitals: { date: '18 septiembre 2026', weight: '84 kg', height: '1.76 m', bmi: '27.1', bloodPressure: '132/84 mmHg', heartRate: '72 lpm', temperature: '36.5 °C', oxygen: '97%' },
    encounters: [{ date: '18 septiembre 2026', title: 'Control de gastritis', detail: 'Refiere mejoría del dolor epigástrico. Se mantiene plan actual y se recomienda control de presión arterial.', clinician: 'Dr. Francisco Ramos' }, { date: '12 julio 2026', title: 'Consulta de seguimiento', detail: 'Ajuste de tratamiento por persistencia de síntomas después de alimentos irritantes.', clinician: 'Dr. Francisco Ramos' }],
    studies: [{ date: '12 julio 2026', name: 'Endoscopia digestiva alta', result: 'Gastritis crónica · reporte disponible' }],
    documents: [{ name: 'Reporte_endoscopia.pdf', detail: 'PDF · 12 jul. 2026' }, { name: 'Indicaciones_julio.pdf', detail: 'PDF · 12 jul. 2026' }],
  },
}

export function getPatient(id: string): Patient | undefined {
  return patients.find((patient) => patient.id === id)
}
