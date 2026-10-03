import 'server-only'

import { cache } from 'react'

import { requirePatient, requireStaff } from '@/modules/auth/session'
import { audit } from '@/modules/audit/log'
import * as repository from './repository'
import type { ClinicalNote, ClinicalRecord, Medication, Patient, Study } from './types'

export type { ClinicalRecord, Patient } from './types'

/*
 * Data Access Layer de pacientes: cada función verifica sesión y permiso antes de leer.
 * Las consultas al expediente quedan registradas en la bitácora (NOM-024-SSA3-2012).
 */

export async function listPatients(query?: string): Promise<Patient[]> {
  await requireStaff('patients')
  return repository.searchPatients(query)
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  await requireStaff('patients')
  return repository.findPatientById(id)
}

/** `cache` evita registrar dos consultas cuando la página y sus metadatos leen el mismo expediente. */
export const getPatientChart = cache(async (id: string): Promise<{ patient: Patient; record: ClinicalRecord } | null> => {
  const user = await requireStaff('record')
  const [patient, record] = await Promise.all([repository.findPatientById(id), repository.findRecordByPatientId(id)])
  if (!patient || !record) return null
  audit(user, 'consulta', 'Expediente', patient.id, `Consultó el expediente ${patient.record}`)
  return { patient, record }
})

export type NoteWithPatient = ClinicalNote & { patient: Patient }

export async function listRecentNotes(limit = 20): Promise<NoteWithPatient[]> {
  await requireStaff('consultations')
  const [patients, records] = await Promise.all([repository.searchPatients(), repository.listRecords()])
  return records
    .flatMap((record) => record.notes.map((note) => ({ ...note, patient: patients.find((p) => p.id === record.patientId)! })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}

export type StudyWithPatient = Study & { patient: Patient }

export async function listStudies(filter: { open?: boolean } = {}): Promise<StudyWithPatient[]> {
  await requireStaff('laboratory')
  const [patients, records] = await Promise.all([repository.searchPatients(), repository.listRecords()])
  return records
    .flatMap((record) => record.studies.map((study) => ({ ...study, patient: patients.find((p) => p.id === record.patientId)! })))
    .filter((study) => !filter.open || study.status === 'solicitado' || study.status === 'en-proceso')
    .sort((a, b) => (a.priority === b.priority ? b.orderedAt.localeCompare(a.orderedAt) : a.priority === 'urgente' ? -1 : 1))
}

export async function countPendingStudies() {
  await requireStaff('dashboard')
  const records = await repository.listRecords()
  return records.flatMap((record) => record.studies).filter((study) => study.status === 'solicitado' || study.status === 'en-proceso').length
}

export type PrescriptionWithPatient = Medication & { patient: Patient }

/** Recetas activas para farmacia: por surtir y surtidas recientemente. */
export async function listPrescriptions(): Promise<{ pending: PrescriptionWithPatient[]; dispensed: PrescriptionWithPatient[] }> {
  await requireStaff('pharmacy')
  const [patients, records] = await Promise.all([repository.searchPatients(), repository.listRecords()])
  const all = records.flatMap((record) => record.medications.map((m) => ({ ...m, patient: patients.find((p) => p.id === record.patientId)! })))
  return {
    pending: all.filter((m) => m.status === 'activo' && !m.dispensed).sort((a, b) => b.startDate.localeCompare(a.startDate)),
    dispensed: all.filter((m) => m.dispensed).sort((a, b) => b.dispensed!.at.localeCompare(a.dispensed!.at)).slice(0, 10),
  }
}

/** Pacientes con signos vitales alarmantes en las últimas 24 h (para el tablero). */
export async function listLatestVitals(): Promise<{ patient: Patient; vitals: ClinicalRecord['vitals'][number] }[]> {
  await requireStaff('record')
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString()
  const [patients, records] = await Promise.all([repository.searchPatients(), repository.listRecords()])
  return records.flatMap((record) => {
    const latest = record.vitals.at(-1)
    const patient = patients.find((p) => p.id === record.patientId)
    return latest && patient && latest.takenAt >= since ? [{ patient, vitals: latest }] : []
  })
}

/** Expediente del propio paciente autenticado en el portal: solo lo que el médico ha liberado. */
export async function getMyChart(): Promise<{ patient: Patient; record: ClinicalRecord }> {
  const patient = await requirePatient()
  const record = await repository.findRecordByPatientId(patient.id)
  if (!record) throw new Error('Expediente no encontrado')
  return { patient, record: { ...record, studies: record.studies.filter((s) => s.releasedToPatient && s.status === 'resultado') } }
}
