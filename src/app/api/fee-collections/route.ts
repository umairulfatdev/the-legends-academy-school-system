import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.feePayment.findMany({
      orderBy: {
        paidAt: "desc",
      },
      include: {
        student: {
          select: {
            fullName: true,
            rollNumber: true,
          },
        },
        voucher: {
          select: {
            voucherNumber: true,
            feeMonth: true,
            totalAmount: true,
            remainingAmount: true,
            items: {
              include: {
                feeType: true,
              },
            },
          },
        },
      },
    });

    const result = payments.map((payment) => ({
      id: payment.id,
      studentId: payment.studentId,
      studentName: payment.student?.fullName ?? "",
      feeTypeId: payment.voucher?.items?.[0]?.feeTypeId ?? "",
      feeTypeName:
        payment.voucher?.items?.[0]?.feeType?.name ?? "",
      month: payment.voucher?.feeMonth ?? "",
      amountDue: Number(payment.voucher?.totalAmount ?? 0),
      paidAmount: Number(payment.amount ?? 0),
      remainingAmount: Number(
        payment.voucher?.remainingAmount ?? 0
      ),
      paymentDate: payment.paidAt,
      paymentMethod: payment.method,
      status: payment.status,
      receiptNo: payment.receiptNumber,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET fee collections error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load fee collections.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      studentId,
      feeTypeId,
      month,
      amountDue,
      paidAmount,
      paymentDate,
      paymentMethod,
    } = body;

    if (
      !studentId ||
      !feeTypeId ||
      !month ||
      amountDue === undefined ||
      paidAmount === undefined
    ) {
      return NextResponse.json(
        {
          error: "Required fee payment information is missing.",
        },
        { status: 400 }
      );
    }

    const due = Number(amountDue);
    const paid = Number(paidAmount);

    if (!Number.isFinite(due) || due <= 0) {
      return NextResponse.json(
        {
          error: "Amount due must be greater than 0.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(paid) || paid < 0) {
      return NextResponse.json(
        {
          error: "Paid amount cannot be negative.",
        },
        { status: 400 }
      );
    }

    if (paid > due) {
      return NextResponse.json(
        {
          error: "Paid amount cannot be greater than amount due.",
        },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          error: "Student not found.",
        },
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
        {
          error: "Fee type not found.",
        },
        { status: 404 }
      );
    }

    const remaining = due - paid;

    const status =
      paid === 0
        ? "UNPAID"
        : paid >= due
        ? "PAID"
        : "PARTIAL";

    const receiptNumber = `REC-${Date.now()}`;

    const result = await prisma.$transaction(async (tx) => {
      let activeSession =
        await tx.academicSession.findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            startDate: "desc",
          },
        });

      if (!activeSession) {
        activeSession =
          await tx.academicSession.create({
            data: {
              name: "2026-2027",
              startDate: new Date("2026-04-01"),
              endDate: new Date("2027-03-31"),
              isActive: true,
            },
          });
      }

      const voucher =
        await tx.feeVoucher.create({
          data: {
            voucherNumber: `VCH-${Date.now()}`,
            studentId,
            sessionId: activeSession.id,
            feeMonth: new Date(month),
            dueDate: paymentDate
              ? new Date(paymentDate)
              : new Date(),
            subtotal: due,
            discount: 0,
            lateFee: 0,
            totalAmount: due,
            paidAmount: paid,
            remainingAmount: remaining,
            status,
            items: {
              create: {
                feeTypeId,
                description: feeType.name,
                amount: due,
              },
            },
          },
        });

      const payment =
        await tx.feePayment.create({
          data: {
            receiptNumber,
            voucherId: voucher.id,
            studentId,
            amount: paid,
            method: paymentMethod || "CASH",
            status: "SUCCESS",
            paidAt: paymentDate
              ? new Date(paymentDate)
              : new Date(),
          },
        });

      return {
        voucher,
        payment,
      };
    });

    return NextResponse.json(
      {
        message: "Fee payment saved successfully.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST fee collection error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save fee payment.",
      },
      { status: 500 }
    );
  }
}