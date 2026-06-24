import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { Establishment } from "@/lib/core/entities/establishment";

// Registrar fuentes estándar para asegurar una buena tipografía en el PDF
// Usaremos Helvetica (que viene por defecto en react-pdf y no requiere llamadas de red)
// para evitar problemas de CORS o fallos en entornos sin conexión a internet.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#1e293b",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  headerBar: {
    height: 8,
    backgroundColor: "#0284c7", // Sky 600
    width: "100%",
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a", // Slate 900
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  disclaimerContainer: {
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
    paddingLeft: 12,
    marginBottom: 30,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#334155", // Slate 700
    textAlign: "justify",
  },
  qrSection: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    flex: 1,
  },
  qrFrame: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 15,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInstructions: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "bold",
    marginBottom: 6,
  },
  linkText: {
    fontSize: 10,
    color: "#0284c7",
    textDecoration: "underline",
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 18,
    marginTop: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoColumn: {
    width: "48%",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 10,
    color: "#0f172a",
    fontWeight: "bold",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
});

interface EstablishmentPDFDocumentProps {
  establishment: Establishment;
  qrCodeUrl: string;
  companyName: string;
  companyRuc: string;
  link: string;
}

export function EstablishmentPDFDocument({
  establishment,
  qrCodeUrl,
  companyName,
  companyRuc,
  link,
}: EstablishmentPDFDocumentProps) {
  const isFisico = establishment.type_address === "Fisico";

  return (
    <Document title={`Libro de Reclamaciones - ${establishment.name}`}>
      <Page size="A4" style={styles.page}>
        <View>
          {/* Barra decorativa superior */}
          <View style={styles.headerBar} />

          {/* Título Principal */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>LIBRO DE RECLAMACIONES</Text>
            <Text style={styles.subtitle}>Aviso Obligatorio al Consumidor</Text>
          </View>

          {/* Texto Legal */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571), 
              este establecimiento cuenta con un Libro de Reclamaciones Virtual a su disposición. 
              Ante cualquier disconformidad, queja o reclamo con respecto al producto o servicio adquirido, 
              sírvase registrarlo en nuestro portal virtual.
            </Text>
          </View>

          {/* Sección de Código QR */}
          <View style={styles.qrSection}>
            <View style={styles.qrFrame}>
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} style={styles.qrImage} />
              ) : null}
            </View>
            <Text style={styles.qrInstructions}>
              ESCANEA ESTE CÓDIGO QR PARA REGISTRAR TU RECLAMO
            </Text>
            <Text style={styles.linkText}>{link}</Text>
          </View>
        </View>

        {/* Sección de Información de la Empresa y Local */}
        <View>
          <View style={styles.infoSection}>
            <View style={styles.infoGrid}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Proveedor (Razón Social)</Text>
                <Text style={styles.infoValue}>{companyName}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>R.U.C.</Text>
                <Text style={styles.infoValue}>{companyRuc}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Establecimiento / Sede</Text>
                <Text style={styles.infoValue}>{establishment.name}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>
                  {isFisico ? "Dirección" : "Página Web / Canal"}
                </Text>
                <Text style={styles.infoValue}>
                  {isFisico
                    ? `${establishment.address || ""}${
                        establishment.district
                          ? `, ${establishment.district} - ${establishment.province || ""}`
                          : ""
                      }`
                    : establishment.web_page || "Digital"}
                </Text>
              </View>
            </View>
          </View>

          {/* Pie de página */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Plataforma Digital de Libro de Reclamaciones - Desarrollado conforme a ley.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
