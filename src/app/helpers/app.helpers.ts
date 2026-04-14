import { API_Config, API_Data } from "../config/api-config";

export class AppHelpers {
  public static matchApiConfig(id: string | null): API_Config | null {
    if (!id) {
      return null;
    }

    const doc = API_Data.find((item) => item.id === id) ?? null;
    return doc;
  }

  // YYYY-MM-DD
  public static todayYMD(tz = 'Europe/Zurich') {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const year = parts.find(p => p.type === 'year')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    const day = parts.find(p => p.type === 'day')!.value;

    const dateF = `${year}-${month}-${day}`;
    
    return dateF;
  }

  // UTC datetime with milliseconds and trailing Z
  public static nowZulu() {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
    const dateF = `${y}-${m}-${day}T${hh}:${mm}:${ss}.${ms}Z`;

    return dateF;
  }

  // from https://stackoverflow.com/a/47317538
  public static prettyPrintXML(sourceXml: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sourceXml, 'application/xml');
    
    const xsltString = `
      <xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
        <xsl:strip-space elements="*"/>
        <xsl:output indent="yes"/>
        
        <!-- change to just text() to strip space in text nodes -->
        <xsl:template match="para[content-style][not(text())]">
          <xsl:value-of select="normalize-space(.)"/>
        </xsl:template>
        <xsl:template match="node()|@*">
          <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>
        </xsl:template>
      </xsl:stylesheet>
    `;
    const xsltDoc = parser.parseFromString(xsltString, 'application/xml');
    
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    const transformedDoc = xsltProcessor.transformToDocument(xmlDoc);
    const serializer = new XMLSerializer();
    const resultXml = serializer.serializeToString(transformedDoc);

    return resultXml;
  }
}
