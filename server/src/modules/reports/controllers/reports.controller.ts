import { Controller, Get, Param, UseGuards, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ReportsService } from "../services/reports.service";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";

@Controller("reports")
@UseGuards(AuthGuard("jwt"))
@ApiTags('Reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("settlement/:monthId/pdf")
    @ApiOperation({ summary: 'Download Settlement Pdf' })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 200, description: 'Success' })
  async downloadSettlementPdf(
    @Param("monthId") monthId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer =
        await this.reportsService.generateSettlementPdf(monthId);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="settlement-${monthId}.pdf"`,
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
}
