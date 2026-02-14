-- CreateTable
CREATE TABLE "ImageGallery" (
    "id" SERIAL NOT NULL,
    "images" TEXT[],

    CONSTRAINT "ImageGallery_pkey" PRIMARY KEY ("id")
);
