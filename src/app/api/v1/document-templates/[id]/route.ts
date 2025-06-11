import { NextRequest, NextResponse } from 'next/server';

// Mock data for document templates (same as in the parent route)
const mockTemplates = [
  {
    id: "template-001",
    name: "Projet de loi standard",
    description: "Structure standard pour les projets de loi",
    documentTypeId: "type-001",
    content: `# Projet de loi relatif à [SUJET]

## Exposé des motifs

[Insérer ici l'exposé des motifs du projet de loi]

## Article 1

[Disposition principale]

## Article 2

[Disposition secondaire]

## Article 3

[Modalités d'application]

## Article 4

La présente loi entre en vigueur le [DATE].`,
    format: "markdown",
    createdAt: new Date(2023, 5, 15).toISOString(),
    updatedAt: new Date(2023, 5, 15).toISOString(),
    createdBy: {
      id: "user-001",
      name: "Martin Dupont"
    }
  },
  {
    id: "template-002",
    name: "Décret d'application",
    description: "Modèle pour les décrets d'application",
    documentTypeId: "type-003",
    content: `# Décret n° [NUMÉRO] du [DATE]

## Article 1

[Champ d'application]

## Article 2

[Dispositions générales]

## Article 3

[Modalités d'exécution]

## Article 4

Le ministre de [MINISTÈRE] est chargé de l'exécution du présent décret, qui sera publié au Journal officiel de la République française.`,
    format: "markdown",
    createdAt: new Date(2023, 6, 20).toISOString(),
    updatedAt: new Date(2023, 10, 5).toISOString(),
    createdBy: {
      id: "user-002",
      name: "Sophie Martin"
    }
  },
  {
    id: "template-003",
    name: "Arrêté ministériel",
    description: "Modèle pour les arrêtés ministériels",
    documentTypeId: "type-004",
    content: `# Arrêté du [DATE] relatif à [SUJET]

Le ministre de [MINISTÈRE],

Vu le code [CODE CONCERNÉ], notamment ses articles [ARTICLES] ;
Vu le décret n° [NUMÉRO] du [DATE] relatif à [SUJET] ;

Arrête :

## Article 1

[Disposition principale]

## Article 2

[Disposition secondaire]

## Article 3

Le directeur général de [ORGANISME] est chargé de l'exécution du présent arrêté, qui sera publié au Journal officiel de la République française.`,
    format: "markdown",
    createdAt: new Date(2023, 7, 10).toISOString(),
    updatedAt: new Date(2023, 7, 10).toISOString(),
    createdBy: {
      id: "user-003",
      name: "Jean Legrand"
    }
  }
];

// Helper function to get a template by ID
function getTemplateById(id: string) {
  return mockTemplates.find(template => template.id === id);
}

// GET handler for retrieving a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = getTemplateById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      data: template,
      status: 200,
      message: 'Template retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving template:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve template' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = getTemplateById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Update template properties
    if (body.name) template.name = body.name;
    if (body.description !== undefined) template.description = body.description;
    if (body.documentTypeId) template.documentTypeId = body.documentTypeId;
    if (body.content) template.content = body.content;
    if (body.format) template.format = body.format;
    if (body.metadata) {
      template.metadata = {
        ...template.metadata || {},
        ...body.metadata,
      };
    }
    
    // Update the updatedAt timestamp
    template.updatedAt = new Date().toISOString();
    
    return NextResponse.json({
      data: template,
      status: 200,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { message: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateIndex = mockTemplates.findIndex(template => template.id === params.id);
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Remove the template from the array
    mockTemplates.splice(templateIndex, 1);
    
    return NextResponse.json({
      data: { success: true },
      status: 200,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { message: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 