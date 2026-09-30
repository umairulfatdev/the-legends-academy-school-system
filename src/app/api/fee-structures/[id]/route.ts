import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const structure = await prisma.feeStructure.findUnique({
      where: {
        id,
      },
      include: {
        feeType: true,
        classRoom: true,
      },
    });

    if (!structure) {
      return NextResponse.json(
        { error: "Fee structure not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(structure);
  } catch (error) {
    console.error("GET fee structure error:", error);

    return NextResponse.json(
      { error: "Unable to load fee structure." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
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

    const existing = await prisma.feeStructure.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fee structure not found." },
        { status: 404 }
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

    const structure = await prisma.feeStructure.update({
      where: {
        id,
      },
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

    return NextResponse.json(structure);
  } catch (error) {
    console.error("PUT fee structure error:", error);

    return NextResponse.json(
      { error: "Unable to update fee structure." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.feeStructure.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fee structure not found." },
        { status: 404 }
      );
    }

    await prisma.feeStructure.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Fee structure deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE fee structure error:", error);

    return NextResponse.json(
      { error: "Unable to delete fee structure." },
      { status: 500 }
    );
  }
}