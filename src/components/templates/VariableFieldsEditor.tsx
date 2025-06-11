'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, X, ArrowRight, Pencil, Save, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VariableField {
  id: string;
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

interface VariableFieldsEditorProps {
  content: string;
  onChange: (content: string, variables: VariableField[]) => void;
  initialVariables?: VariableField[];
}

export function VariableFieldsEditor({
  content,
  onChange,
  initialVariables = [],
}: VariableFieldsEditorProps) {
  const [variables, setVariables] = useState<VariableField[]>(initialVariables);
  const [newVariable, setNewVariable] = useState<Partial<VariableField>>({
    key: '',
    label: '',
    description: '',
    defaultValue: '',
    required: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [textContent, setTextContent] = useState(content);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  // Extract variables from the content
  useEffect(() => {
    // This regex matches placeholders like [TITLE], [NAME], etc.
    const regex = /\[([A-Z0-9_]+)\]/g;
    const matches = [...content.matchAll(regex)];
    const vars = matches.map(match => match[1]);
    
    // Filter out duplicates
    const uniqueVars = [...new Set(vars)];
    setDetectedVariables(uniqueVars);
    
    // Update textContent
    setTextContent(content);
  }, [content]);

  // Generate a unique ID
  const generateId = () => {
    return `var_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  // Add a new variable
  const addVariable = () => {
    if (!newVariable.key || !newVariable.label) return;
    
    const id = generateId();
    const variable: VariableField = {
      id,
      key: newVariable.key.toUpperCase(),
      label: newVariable.label,
      description: newVariable.description || '',
      defaultValue: newVariable.defaultValue || '',
      required: newVariable.required || false,
    };
    
    setVariables([...variables, variable]);
    
    // Reset the form
    setNewVariable({
      key: '',
      label: '',
      description: '',
      defaultValue: '',
      required: false,
    });
    
    // Notify parent component
    onChange(textContent, [...variables, variable]);
  };

  // Edit an existing variable
  const startEditing = (variable: VariableField) => {
    setEditingId(variable.id);
    setNewVariable({
      key: variable.key,
      label: variable.label,
      description: variable.description || '',
      defaultValue: variable.defaultValue || '',
      required: variable.required || false,
    });
    setEditMode(true);
  };

  // Save the edited variable
  const saveEditing = () => {
    if (!editingId || !newVariable.key || !newVariable.label) return;
    
    const updatedVariables = variables.map(v => 
      v.id === editingId
        ? {
            ...v,
            key: newVariable.key?.toUpperCase() || v.key,
            label: newVariable.label || v.label,
            description: newVariable.description || '',
            defaultValue: newVariable.defaultValue || '',
            required: newVariable.required || false,
          }
        : v
    );
    
    setVariables(updatedVariables);
    
    // Reset the form
    setNewVariable({
      key: '',
      label: '',
      description: '',
      defaultValue: '',
      required: false,
    });
    setEditingId(null);
    setEditMode(false);
    
    // Notify parent component
    onChange(textContent, updatedVariables);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditMode(false);
    setNewVariable({
      key: '',
      label: '',
      description: '',
      defaultValue: '',
      required: false,
    });
  };

  // Delete a variable
  const deleteVariable = (id: string) => {
    const updatedVariables = variables.filter(v => v.id !== id);
    setVariables(updatedVariables);
    
    // Notify parent component
    onChange(textContent, updatedVariables);
  };

  // Insert a variable into the content at cursor position
  const insertVariable = (key: string) => {
    // This is meant to be used with a text editor, which would handle the insertion
    const updatedContent = `${textContent} [${key}]`;
    setTextContent(updatedContent);
    
    // Notify parent component
    onChange(updatedContent, variables);
  };

  // Create a variable from a detected placeholder
  const createFromDetected = (key: string) => {
    setNewVariable({
      ...newVariable,
      key: key,
      label: key.toLowerCase().replace(/_/g, ' '),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variables détectées</CardTitle>
        </CardHeader>
        <CardContent>
          {detectedVariables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune variable détectée. Utilisez le format [VARIABLE] dans votre contenu.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {detectedVariables.map((variable) => {
                const isDefined = variables.some(v => v.key === variable);
                return (
                  <Badge
                    key={variable}
                    variant={isDefined ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!isDefined) {
                        createFromDetected(variable);
                      }
                    }}
                  >
                    {variable}
                    {!isDefined && (
                      <span className="ml-1 text-xs">
                        (Non définie)
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editMode ? 'Modifier la variable' : 'Ajouter une variable'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label htmlFor="variable-key" className="text-sm font-medium">
                Clé
              </label>
              <Input
                id="variable-key"
                placeholder="Ex: TITRE"
                value={newVariable.key}
                onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                La clé sera automatiquement convertie en majuscules.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="variable-label" className="text-sm font-medium">
                Libellé
              </label>
              <Input
                id="variable-label"
                placeholder="Ex: Titre du document"
                value={newVariable.label}
                onChange={(e) => setNewVariable({ ...newVariable, label: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Le libellé affiché à l'utilisateur lors de la création du document.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <label htmlFor="variable-description" className="text-sm font-medium">
              Description (optionnelle)
            </label>
            <Input
              id="variable-description"
              placeholder="Ex: Le titre principal qui apparaîtra en haut du document"
              value={newVariable.description}
              onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label htmlFor="variable-default" className="text-sm font-medium">
                Valeur par défaut (optionnelle)
              </label>
              <Input
                id="variable-default"
                placeholder="Ex: Nouveau document"
                value={newVariable.defaultValue}
                onChange={(e) => setNewVariable({ ...newVariable, defaultValue: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 h-full pt-8">
              <input
                type="checkbox"
                id="variable-required"
                checked={newVariable.required}
                onChange={(e) => setNewVariable({ ...newVariable, required: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="variable-required" className="text-sm font-medium">
                Champ obligatoire
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={cancelEditing}>
                  Annuler
                </Button>
                <Button onClick={saveEditing}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button 
                onClick={addVariable}
                disabled={!newVariable.key || !newVariable.label}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variables définies</CardTitle>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune variable définie. Ajoutez des variables pour personnaliser vos modèles.
            </p>
          ) : (
            <div className="space-y-4">
              {variables.map((variable) => (
                <div 
                  key={variable.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">
                        [{variable.key}]
                      </Badge>
                      <span className="font-medium">{variable.label}</span>
                      {variable.required && (
                        <Badge variant="destructive" className="ml-2">
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                    {variable.description && (
                      <p className="text-sm text-muted-foreground">
                        {variable.description}
                      </p>
                    )}
                    {variable.defaultValue && (
                      <p className="text-xs text-muted-foreground">
                        Valeur par défaut: {variable.defaultValue}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => insertVariable(variable.key)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEditing(variable)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteVariable(variable.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 