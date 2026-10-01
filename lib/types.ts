export type Role = 'admin' | 'medico' | 'enfermera' | 'recepcion'
export type PatientStatus = 'activo' | 'seguimiento' | 'espera'

export interface Patient {
  id: string
  name: string
  record: string
  age: number
  sex: 'Masculino' | 'Femenino'
  status: PatientStatus
  photo: string
  allergies: string[]
}

export const patientStatusLabels: Record<PatientStatus, string> = {
  activo: 'Activo',
  seguimiento: 'En seguimiento',
  espera: 'En espera',
}
