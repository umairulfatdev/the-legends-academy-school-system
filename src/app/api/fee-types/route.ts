import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────
// GET - list all fee types
// ─────────────────────────────────────────
export async function GET() {
  try {
    const feeTypes = await prisma.feeType.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feeTypes);
  } catch (error) {
    console.error("GET fee types error:", error);

    return NextResponse.json(
      { error: "Unable to load fee types." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// POST - create new fee type
// ─────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = body.description
      ? String(body.description).trim()
      : null;

    if (!name) {
      return NextResponse.json(
        { error: "Fee type name is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.feeType.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This fee type already exists." },
        { status: 409 }
      );
    }

    const feeType = await prisma.feeType.create({
      data: {
        name,
        description,
        isActive:
          typeof body.isActive === "boolean" ? body.isActive : true,
      },
    });

    return NextResponse.json(feeType, { status: 201 });
  } catch (error) {
    console.error("POST fee type error:", error);

    return NextResponse.json(
      { error: "Unable to create fee type." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// PUT - update fee type
// ─────────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Fee type ID is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.feeType.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : undefined,
        description:
          description !== undefined
            ? description
              ? String(description).trim()
              : null
            : undefined,
        isActive:
          typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT fee type error:", error);

    return NextResponse.json(
      { error: "Unable to update fee type." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────
// DELETE - delete fee type
// ─────────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Fee type ID is required." },
        { status: 400 }
      );
    }

    // Check if fee type is being used
    const structuresCount = await prisma.feeStructure.count({
      where: { feeTypeId: id },
    });

    const itemsCount = await prisma.feeVoucherItem.count({
      where: { feeTypeId: id },
    });

    if (structuresCount > 0 || itemsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete — this fee type is used in fee structures or vouchers. Set it inactive instead.",
        },
        { status: 409 }
      );
    }

    await prisma.feeType.delete({ where: { id } });

    return NextResponse.json({ message: "Fee type deleted." });
  } catch (error) {
    console.error("DELETE fee type error:", error);

    return NextResponse.json(
      { error: "Unable to delete fee type." },
      { status: 500 }
    );
  }
}