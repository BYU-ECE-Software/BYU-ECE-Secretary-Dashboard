-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "byuId" TEXT,
    "netId" TEXT,
    "positionId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Position" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Locker" (
    "number" INTEGER NOT NULL,
    "userId" INTEGER,
    "className" TEXT,
    "endDate" DATE,

    CONSTRAINT "Locker_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "public"."Key" (
    "number" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Key_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "public"."Status" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Desk" (
    "number" INTEGER NOT NULL,
    "studentId" INTEGER,
    "statusId" INTEGER NOT NULL,
    "professorId" INTEGER,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Desk_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Code" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CodeRoom" (
    "codeId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "CodeRoom_pkey" PRIMARY KEY ("codeId","roomId")
);

-- CreateTable
CREATE TABLE "public"."StudentRoomAccess" (
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "StudentRoomAccess_pkey" PRIMARY KEY ("userId","roomId")
);

-- CreateTable
CREATE TABLE "public"."ImportantDates" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "assignedDate" DATE NOT NULL,
    "currentOption" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ImportantDates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_byuId_key" ON "public"."User"("byuId");

-- CreateIndex
CREATE UNIQUE INDEX "User_netId_key" ON "public"."User"("netId");

-- CreateIndex
CREATE UNIQUE INDEX "Locker_userId_key" ON "public"."Locker"("userId");

-- CreateIndex
CREATE INDEX "Key_userId_idx" ON "public"."Key"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Desk_studentId_key" ON "public"."Desk"("studentId");

-- CreateIndex
CREATE INDEX "Code_isGlobal_idx" ON "public"."Code"("isGlobal");

-- CreateIndex
CREATE INDEX "CodeRoom_roomId_idx" ON "public"."CodeRoom"("roomId");

-- CreateIndex
CREATE INDEX "StudentRoomAccess_roomId_idx" ON "public"."StudentRoomAccess"("roomId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Locker" ADD CONSTRAINT "Locker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Key" ADD CONSTRAINT "Key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Desk" ADD CONSTRAINT "Desk_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Desk" ADD CONSTRAINT "Desk_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Desk" ADD CONSTRAINT "Desk_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodeRoom" ADD CONSTRAINT "CodeRoom_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "public"."Code"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CodeRoom" ADD CONSTRAINT "CodeRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRoomAccess" ADD CONSTRAINT "StudentRoomAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRoomAccess" ADD CONSTRAINT "StudentRoomAccess_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
