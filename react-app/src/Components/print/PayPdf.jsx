import React from 'react';
import { Button } from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const PdfExportButton = ({ 
  data, 
  columns, 
  title = 'Report', 
  filters = {}, 
  fileName = 'export',
  buttonText = 'Export to PDF',
  buttonProps = {},
  includeFilters = true,
  includeDate = true
}) => {
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      let startY = 15;

      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, startY);
      startY += 10;

      // Add filters if enabled
      if (includeFilters && Object.keys(filters).length > 0) {
        doc.setFontSize(10);
        let filtersText = 'Filters: ';
        
        if (filters.status) filtersText += `Status: ${filters.status}, `;
        if (filters.date_from) filtersText += `From: ${filters.date_from}, `;
        if (filters.date_to) filtersText += `To: ${filters.date_to}, `;
        if (filters.appointment_id) filtersText += `Appointment ID: ${filters.appointment_id}`;
        
        doc.text(filtersText, 14, startY);
        startY += 5;
      }

      // Add generation date if enabled
      if (includeDate) {
        doc.setFontSize(10);
        doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, startY);
        startY += 5;
      }

      // Prepare table data
      const tableData = data.map(item => {
        return columns.map(col => {
          // Handle nested properties (e.g., 'service.name')
          if (col.field.includes('.')) {
            const value = col.field.split('.').reduce((obj, key) => (obj && obj[key]) ? obj[key] : null, item);
            return value || col.defaultValue || 'N/A';
          }

          // Handle date formatting
          if (col.type === 'date' && item[col.field]) {
            try {
              return format(new Date(item[col.field]), col.format || 'PPpp');
            } catch {
              return item[col.field] || col.defaultValue || 'N/A';
            }
          }

          // Handle status capitalization
          if (col.field === 'status') {
            return String(item[col.field]).toUpperCase() || col.defaultValue || 'N/A';
          }

          return item[col.field] || col.defaultValue || 'N/A';
        });
      });

      // Extract headers
      const headers = columns.map(col => col.headerName || col.field);

      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: startY + 5,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [41, 128, 185], // Blue header
          textColor: 255, // White text
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240] // Alternate row color
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // ID column
          1: { cellWidth: 'auto' }, // Amount column
          // Add more column-specific styles if needed
        }
      });

      // Save the PDF
      doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <Button 
      variant="contained" 
      color="secondary" 
      onClick={exportToPDF}
      {...buttonProps}
    >
      {buttonText}
    </Button>
  );
};

export default PdfExportButton;