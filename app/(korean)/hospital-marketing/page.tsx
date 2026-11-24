import { HospitalLanding, hospitalMetadata } from '@/components/hospital/HospitalLanding'

export const metadata = hospitalMetadata('hospital-marketing')

export default function Page() {
  return <HospitalLanding topic="hospital-marketing" />
}
