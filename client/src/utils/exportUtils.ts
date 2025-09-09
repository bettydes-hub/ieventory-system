import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  headers: string[];
  rows: any[][];
  title: string;
  subtitle?: string;
}

export const exportToPDF = (data: ExportData, filename: string = 'report.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(data.title, 14, 22);
  
  // Add subtitle if provided
  if (data.subtitle) {
    doc.setFontSize(12);
    doc.text(data.subtitle, 14, 30);
  }
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
  
  // Add table
  doc.autoTable({
    head: [data.headers],
    body: data.rows,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [24, 144, 255], // Blue header
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 45 },
  });
  
  // Save the PDF
  doc.save(filename);
};

export const exportToExcel = (data: ExportData, filename: string = 'report.xlsx') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create worksheet data
  const worksheetData = [
    [data.title],
    [data.subtitle || ''],
    [`Generated on: ${new Date().toLocaleDateString()}`],
    [], // Empty row
    data.headers,
    ...data.rows,
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const columnWidths = data.headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = columnWidths;
  
  // Style the title row
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    };
  }
  
  // Style the header row
  const headerRowIndex = 4; // 5th row (0-indexed)
  data.headers.forEach((_, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: index });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '1890FF' } },
        alignment: { horizontal: 'center' },
      };
    }
  });
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  // Save the file
  XLSX.writeFile(workbook, filename);
};

export const exportToCSV = (data: ExportData, filename: string = 'report.csv') => {
  // Create CSV content
  const csvContent = [
    data.title,
    data.subtitle || '',
    `Generated on: ${new Date().toLocaleDateString()}`,
    '',
    data.headers.join(','),
    ...data.rows.map(row => row.join(',')),
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to format data for export
export const formatAuditLogData = (auditLogs: any[]): ExportData => {
  return {
    title: 'Inventory System - Audit Logs Report',
    subtitle: 'Complete audit trail of system activities',
    headers: [
      'Date & Time',
      'User',
      'Action',
      'Item',
      'Details',
      'IP Address',
      'Status'
    ],
    rows: auditLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.user,
      log.action,
      log.item || 'N/A',
      log.details,
      log.ipAddress || 'N/A',
      log.status
    ])
  };
};

export const formatInventoryReportData = (items: any[]): ExportData => {
  return {
    title: 'Inventory System - Items Report',
    subtitle: 'Complete inventory items listing',
    headers: [
      'Item Name',
      'Category',
      'Manufacturer',
      'Model',
      'Serial Number',
      'Quantity',
      'Status',
      'Location',
      'Purchase Date'
    ],
    rows: items.map(item => [
      item.name,
      item.category,
      item.manufacturer,
      item.model || 'N/A',
      item.serialNumber || 'N/A',
      item.quantity,
      item.status,
      item.location || 'N/A',
      item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'
    ])
  };
};

export const formatUserReportData = (users: any[]): ExportData => {
  return {
    title: 'Inventory System - Users Report',
    subtitle: 'Complete user accounts listing',
    headers: [
      'Name',
      'Email',
      'Role',
      'Department',
      'Status',
      'Last Login',
      'Created Date'
    ],
    rows: users.map(user => [
      user.name,
      user.email,
      user.role,
      user.department || 'N/A',
      user.status,
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
      new Date(user.createdAt).toLocaleDateString()
    ])
  };
};
