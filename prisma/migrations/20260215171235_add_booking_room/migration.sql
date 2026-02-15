/*
  Warnings:

  - You are about to drop the column `quantity` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "quantity",
DROP COLUMN "roomId";

-- CreateTable
CREATE TABLE "BookingRoom" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "BookingRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
