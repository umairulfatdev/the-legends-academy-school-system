import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const payment = await prisma.feePayment.findUnique({
      where: {
        id,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            rollNumber: true,
          },
        },
        voucher: {
          include: {
            items: {
              include: {
                feeType: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: "Fee payment not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id: payment.id,
      studentId: payment.studentId,
      studentName: payment.student?.fullName ?? "",
      rollNumber: payment.student?.rollNumber ?? "",
      feeTypeId:
        payment.voucher?.items?.[0]?.feeTypeId ?? "",
      feeTypeName:
        payment.voucher?.items?.[0]?.feeType?.name ?? "",
      month: payment.voucher?.feeMonth ?? "",
      amountDue: Number(
        payment.voucher?.totalAmount ?? 0
      ),
      paidAmount: Number(payment.amount ?? 0),
      remainingAmount: Number(
        payment.voucher?.remainingAmount ?? 0
      ),
      paymentDate: payment.paidAt,
      paymentMethod: payment.method,
      status: payment.status,
      receiptNo: payment.receiptNumber,
    });
  } catch (error) {
    console.error("GET fee collection error:", error);

    return NextResponse.json(
      {
        error: "Unable to load fee payment.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const payment = await prisma.feePayment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        voucherId: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: "Fee payment not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.feePayment.delete({
        where: {
          id,
        },
      });

      if (payment.voucherId) {
        await tx.feeVoucher.delete({
          where: {
            id: payment.voucherId,
          },
        });
      }
    });

    return NextResponse.json({
      message: "Fee payment deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE fee collection error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete fee payment.",
      },
      {
        status: 500,
      }
    );
  }
}