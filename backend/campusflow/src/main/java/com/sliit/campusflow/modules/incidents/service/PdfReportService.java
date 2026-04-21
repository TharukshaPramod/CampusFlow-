package com.sliit.campusflow.modules.incidents.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sliit.campusflow.modules.incidents.model.Incident;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfReportService {

    private static final DateTimeFormatter instantFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());
    private static final DateTimeFormatter localFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generateIncidentReport(Incident incident) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph title = new Paragraph("Incident Report: " + incident.getTicketNumber(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Basic Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(10f);
            infoTable.setSpacingAfter(20f);

            addTableRow(infoTable, "Title", incident.getTitle());
            addTableRow(infoTable, "Category", incident.getCategory());
            addTableRow(infoTable, "Priority", incident.getPriority().name());
            addTableRow(infoTable, "Status", incident.getStatus().name());
            addTableRow(infoTable, "Created At", incident.getCreatedAt() != null ? instantFormatter.format(incident.getCreatedAt()) : "N/A");
            addTableRow(infoTable, "Creator", incident.getCreator() != null ? incident.getCreator().getName() : "Unknown");
            addTableRow(infoTable, "Technician", incident.getTechnician() != null ? incident.getTechnician().getName() : "Unassigned");
            addTableRow(infoTable, "Location", incident.getLocation() != null ? incident.getLocation() : "N/A");
            addTableRow(infoTable, "Resource", incident.getResource() != null ? incident.getResource().getName() : "N/A");
            
            document.add(infoTable);

            // Description Section
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Paragraph descTitle = new Paragraph("Description", sectionFont);
            descTitle.setSpacingAfter(10);
            document.add(descTitle);

            Paragraph descContent = new Paragraph(incident.getDescription());
            descContent.setSpacingAfter(20);
            document.add(descContent);

            // Resolution Notes (If Resolved/Closed)
            if (incident.getResolutionNotes() != null && !incident.getResolutionNotes().isBlank()) {
                Paragraph resTitle = new Paragraph("Resolution Notes", sectionFont);
                resTitle.setSpacingAfter(10);
                document.add(resTitle);

                Paragraph resContent = new Paragraph(incident.getResolutionNotes());
                resContent.setSpacingAfter(20);
                document.add(resContent);
                
                if (incident.getResolvedAt() != null) {
                    document.add(new Paragraph("Resolved At: " + incident.getResolvedAt().format(localFormatter)));
                }
            }
            
            // Rejection Reason (If Rejected)
            if (incident.getRejectionReason() != null && !incident.getRejectionReason().isBlank()) {
                Paragraph rejTitle = new Paragraph("Rejection Reason", sectionFont);
                rejTitle.setSpacingAfter(10);
                document.add(rejTitle);

                Paragraph rejContent = new Paragraph(incident.getRejectionReason());
                rejContent.setSpacingAfter(20);
                document.add(rejContent);
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF for incident " + incident.getId(), e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private void addTableRow(PdfPTable table, String key, String value) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

        PdfPCell cell1 = new PdfPCell(new Phrase(key, headerFont));
        cell1.setPadding(5);
        
        PdfPCell cell2 = new PdfPCell(new Phrase(value != null ? value : "", valueFont));
        cell2.setPadding(5);

        table.addCell(cell1);
        table.addCell(cell2);
    }
}
