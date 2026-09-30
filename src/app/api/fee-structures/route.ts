import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const structures = await prisma.feeStructure.findMany({
      include: {
        feeType: true,
        classRoom: true,
      },
      orderBy: {
        effectiveFrom: "desc",
      },
    });

    return NextResponse.json(structures);
  } catch (error) {
    console.error("GET fee structures error:", error);

    return NextResponse.json(
      { error: "Unable to load fee structures." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const feeTypeId = String(body.feeTypeId || "").trim();

    const classId = body.classId
      ? String(body.classId).trim()
      : null;

    const amount = Number(body.amount);

    const effectiveFrom = body.effectiveFrom
      ? new Date(body.effectiveFrom)
      : new Date();

    const effectiveTo = body.effectiveTo
      ? new Date(body.effectiveTo)
      : null;

    const isActive =
      body.isActive === undefined
        ? true
        : Boolean(body.isActive);

    if (!feeTypeId) {
      return NextResponse.json(
        { error: "Fee type is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        { error: "Amount must be a valid number." },
        { status: 400 }
      );
    }

    if (Number.isNaN(effectiveFrom.getTime())) {
      return NextResponse.json(
        { error: "Invalid effective from date." },
        { status: 400 }
      );
    }

    if (
      effectiveTo &&
      Number.isNaN(effectiveTo.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid effective to date." },
        { status: 400 }
      );
    }

    const feeType = await prisma.feeType.findUnique({
      where: {
        id: feeTypeId,
      },
    });

    if (!feeType) {
      return NextResponse.json(
        { error: "Fee type not found." },
        { status: 404 }
      );
    }

    if (classId) {
      const classRoom = await prisma.classRoom.findUnique({
        where: {
          id: classId,
        },
      });

      if (!classRoom) {
        return NextResponse.json(
          { error: "Class not found." },
          { status: 404 }
        );
      }
    }

    const structure = await prisma.feeStructure.create({
      data: {
        feeTypeId,
        classId,
        amount,
        effectiveFrom,
        effectiveTo,
        isActive,
      },
      include: {
        feeType: true,
        classRoom: true,
      },
    });

    return NextResponse.json(structure, {
      status: 201,
    });
  } catch (error) {
    console.error("POST fee structure error:", error);

    return NextResponse.json(
      { error: "Unable to create fee structure." },
      { status: 500 }
    );
  }
}
