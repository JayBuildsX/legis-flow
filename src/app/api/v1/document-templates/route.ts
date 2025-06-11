import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Mock data for document templates
const mockTemplates = [
  {
    id: "template-001",
    name: "Projet de loi standard",
    description: "Structure standard pour les projets de loi",
    documentTypeId: "type-001",
    content: `# Projet de loi relatif à [SUJET]

## Exposé des motifs

[EXPOSE_MOTIFS]

## Article 1

[DISPOSITION_PRINCIPALE]

## Article 2

[DISPOSITION_SECONDAIRE]

## Article 3

[MODALITES_APPLICATION]

## Article 4

La présente loi entre en vigueur le [DATE_VIGUEUR].`,
    format: "markdown",
    createdAt: new Date(2023, 5, 15).toISOString(),
    updatedAt: new Date(2023, 5, 15).toISOString(),
    createdBy: {
      id: "user-001",
      name: "Martin Dupont"
    },
    metadata: {
      variables: [
        {
          id: "var_1",
          key: "SUJET",
          label: "Sujet de la loi",
          description: "Le sujet principal de la loi",
          required: true
        },
        {
          id: "var_2",
          key: "EXPOSE_MOTIFS",
          label: "Exposé des motifs",
          description: "Explication des raisons et objectifs de la loi",
          required: true
        },
        {
          id: "var_3",
          key: "DISPOSITION_PRINCIPALE",
          label: "Disposition principale",
          description: "Article principal de la loi"
        },
        {
          id: "var_4",
          key: "DISPOSITION_SECONDAIRE",
          label: "Disposition secondaire",
          description: "Article secondaire de la loi"
        },
        {
          id: "var_5",
          key: "MODALITES_APPLICATION",
          label: "Modalités d'application",
          description: "Comment la loi sera appliquée"
        },
        {
          id: "var_6",
          key: "DATE_VIGUEUR",
          label: "Date d'entrée en vigueur",
          defaultValue: "1er janvier 2024"
        }
      ]
    }
  },
  {
    id: "template-002",
    name: "Décret d'application",
    description: "Modèle pour les décrets d'application",
    documentTypeId: "type-003",
    content: `# Décret n° [NUMERO] du [DATE]

## Article 1

[CHAMP_APPLICATION]

## Article 2

[DISPOSITIONS_GENERALES]

## Article 3

[MODALITES_EXECUTION]

## Article 4

Le ministre de [MINISTERE] est chargé de l'exécution du présent décret, qui sera publié au Journal officiel de la République française.`,
    format: "markdown",
    createdAt: new Date(2023, 6, 20).toISOString(),
    updatedAt: new Date(2023, 10, 5).toISOString(),
    createdBy: {
      id: "user-002",
      name: "Sophie Martin"
    },
    metadata: {
      variables: [
        {
          id: "var_1",
          key: "NUMERO",
          label: "Numéro du décret",
          required: true
        },
        {
          id: "var_2",
          key: "DATE",
          label: "Date du décret",
          required: true,
          defaultValue: new Date().toLocaleDateString('fr-FR')
        },
        {
          id: "var_3",
          key: "CHAMP_APPLICATION",
          label: "Champ d'application",
          description: "Définit le domaine d'application du décret"
        },
        {
          id: "var_4",
          key: "DISPOSITIONS_GENERALES",
          label: "Dispositions générales"
        },
        {
          id: "var_5",
          key: "MODALITES_EXECUTION",
          label: "Modalités d'exécution"
        },
        {
          id: "var_6",
          key: "MINISTERE",
          label: "Ministère concerné",
          defaultValue: "l'Économie et des Finances"
        }
      ]
    }
  },
  {
    id: "template-003",
    name: "Arrêté ministériel",
    description: "Modèle pour les arrêtés ministériels",
    documentTypeId: "type-004",
    content: `# Arrêté du [DATE] relatif à [SUJET]

Le ministre de [MINISTERE],

Vu le code [CODE_CONCERNE], notamment ses articles [ARTICLES] ;
Vu le décret n° [NUMERO_DECRET] du [DATE_DECRET] relatif à [SUJET_DECRET] ;

Arrête :

## Article 1

[DISPOSITION_PRINCIPALE]

## Article 2

[DISPOSITION_SECONDAIRE]

## Article 3

Le directeur général de [ORGANISME] est chargé de l'exécution du présent arrêté, qui sera publié au Journal officiel de la République française.`,
    format: "markdown",
    createdAt: new Date(2023, 7, 10).toISOString(),
    updatedAt: new Date(2023, 7, 10).toISOString(),
    createdBy: {
      id: "user-003",
      name: "Jean Legrand"
    },
    metadata: {
      variables: [
        {
          id: "var_1",
          key: "DATE",
          label: "Date de l'arrêté",
          required: true,
          defaultValue: new Date().toLocaleDateString('fr-FR')
        },
        {
          id: "var_2",
          key: "SUJET",
          label: "Sujet de l'arrêté",
          required: true
        },
        {
          id: "var_3",
          key: "MINISTERE",
          label: "Ministère concerné",
          defaultValue: "l'Économie et des Finances"
        },
        {
          id: "var_4",
          key: "CODE_CONCERNE",
          label: "Code concerné",
          required: true
        },
        {
          id: "var_5",
          key: "ARTICLES",
          label: "Articles du code"
        },
        {
          id: "var_6",
          key: "NUMERO_DECRET",
          label: "Numéro du décret"
        },
        {
          id: "var_7",
          key: "DATE_DECRET",
          label: "Date du décret"
        },
        {
          id: "var_8",
          key: "SUJET_DECRET",
          label: "Sujet du décret"
        },
        {
          id: "var_9",
          key: "DISPOSITION_PRINCIPALE",
          label: "Disposition principale"
        },
        {
          id: "var_10",
          key: "DISPOSITION_SECONDAIRE",
          label: "Disposition secondaire"
        },
        {
          id: "var_11",
          key: "ORGANISME",
          label: "Organisme chargé de l'exécution"
        }
      ]
    }
  }
];

// Helper function to get templates
function getTemplates() {
  return [...mockTemplates];
}

// Helper function to get a template by ID
function getTemplateById(id: string) {
  return mockTemplates.find(template => template.id === id);
}

// GET handler for retrieving all templates
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const documentTypeId = url.searchParams.get('documentTypeId');
    
    let templates = getTemplates();
    
    // Filter by document type if specified
    if (documentTypeId) {
      templates = templates.filter(template => template.documentTypeId === documentTypeId);
    }
    
    return NextResponse.json({
      data: templates,
      status: 200,
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving templates:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve templates' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.documentTypeId || !body.content) {
      return NextResponse.json(
        { message: 'Missing required fields: name, documentTypeId, and content are required' },
        { status: 400 }
      );
    }
    
    // Create a new template
    const newTemplate = {
      id: `template-${randomUUID()}`,
      name: body.name,
      description: body.description || '',
      documentTypeId: body.documentTypeId,
      content: body.content,
      format: body.format || 'markdown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-001', // In a real app, this would be the current user's ID
        name: 'Martin Dupont' // In a real app, this would be the current user's name
      },
      metadata: body.metadata || { variables: [] }
    };
    
    // In a real app, we would save to a database here
    mockTemplates.push(newTemplate);
    
    return NextResponse.json({
      data: newTemplate,
      status: 201,
      message: 'Template created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { message: 'Failed to create template' },
      { status: 500 }
    );
  }
} 