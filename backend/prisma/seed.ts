import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  if (process.env.SEED_RESET !== 'true') {
    console.log('Seed skipped. Set SEED_RESET=true to wipe trips and bookings.')
    return
  }

  await prisma.bookingSnapshot.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.seat.deleteMany()
  await prisma.van.deleteMany()
  await prisma.driverDocument.deleteMany()
  await prisma.driverApplication.deleteMany()
  await prisma.vehicleDocument.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.driverBankAccount.deleteMany()
  await prisma.emergencyContact.deleteMany()
  await prisma.address.deleteMany()
  console.log('Database reset complete.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
