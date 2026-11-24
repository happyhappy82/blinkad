import { HospitalLanding, hospitalMetadata } from '@/components/hospital/HospitalLanding'

export const metadata = hospitalMetadata('hospital-work')

export default function Page() {
  return <HospitalLanding topic="hospital-work" />
}
