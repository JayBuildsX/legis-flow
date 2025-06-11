'use client';

import { useState, useEffect } from 'react';
import { LucideSearch, LucideFilter, LucideX, LucideSave } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import SearchBox from './SearchBox';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type DocumentType = 'law' | 'decree' | 'order' | 'circular' | 'other';

export interface SearchFilters {
  searchTerm: string;
  status: DocumentStatus[];
  type: DocumentType[];
  tags: string[];
  dateFrom: string | null;
  dateTo: string | null;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
}

interface DocumentSearchFiltersProps {
  filters?: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags?: string[];
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  status: [],
  type: [],
  tags: [],
  dateFrom: null,
  dateTo: null,
};

export default function DocumentSearchFilters({ 
  filters = defaultFilters, 
  onFiltersChange, 
  availableTags = [] 
}: DocumentSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedSearchName, setSavedSearchName] = useState('');
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);

  // Update localFilters when the filters prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Status options with label and value
  const statusOptions: { label: string; value: DocumentStatus }[] = [
    { label: 'Brouillon', value: 'draft' },
    { label: 'Révision', value: 'review' },
    { label: 'Approuvé', value: 'approved' },
    { label: 'Publié', value: 'published' },
    { label: 'Archivé', value: 'archived' },
  ];

  // Type options with label and value
  const typeOptions: { label: string; value: DocumentType }[] = [
    { label: 'Loi', value: 'law' },
    { label: 'Décret', value: 'decree' },
    { label: 'Arrêté', value: 'order' },
    { label: 'Circulaire', value: 'circular' },
    { label: 'Autre', value: 'other' },
  ];

  // Count active filters
  const activeFiltersCount =
    (localFilters.status.length > 0 ? 1 : 0) +
    (localFilters.type.length > 0 ? 1 : 0) +
    (localFilters.tags.length > 0 ? 1 : 0) +
    (localFilters.dateFrom || localFilters.dateTo ? 1 : 0);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedDocumentSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved searches', e);
      }
    }
  }, []);

  // Handle search term change
  const handleSearchTermChange = (value: string) => {
    const newFilters = { ...localFilters, searchTerm: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle status filter change
  const handleStatusChange = (value: DocumentStatus, checked: boolean) => {
    const newStatus = checked
      ? [...localFilters.status, value]
      : localFilters.status.filter((s) => s !== value);
      
    const newFilters = { ...localFilters, status: newStatus };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle type filter change
  const handleTypeChange = (value: DocumentType, checked: boolean) => {
    const newTypes = checked
      ? [...localFilters.type, value]
      : localFilters.type.filter((t) => t !== value);
      
    const newFilters = { ...localFilters, type: newTypes };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle tag filter change
  const handleTagChange = (value: string, checked: boolean) => {
    const newTags = checked
      ? [...localFilters.tags, value]
      : localFilters.tags.filter((t) => t !== value);
      
    const newFilters = { ...localFilters, tags: newTags };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle date range change
  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    const newFilters = { ...localFilters, [field]: value || null };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setIsFilterOpen(false);
  };

  // Save current search
  const saveCurrentSearch = () => {
    if (!savedSearchName.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name: savedSearchName.trim(),
      filters: { ...localFilters },
    };

    const updatedSavedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSavedSearches);
    localStorage.setItem('savedDocumentSearches', JSON.stringify(updatedSavedSearches));
    setSavedSearchName('');
    setIsSaveSearchOpen(false);
  };

  // Apply saved search
  const applySavedSearch = (search: SavedSearch) => {
    setLocalFilters(search.filters);
    onFiltersChange(search.filters);
  };

  // Delete saved search
  const deleteSavedSearch = (id: string) => {
    const updatedSavedSearches = savedSearches.filter((search) => search.id !== id);
    setSavedSearches(updatedSavedSearches);
    localStorage.setItem('savedDocumentSearches', JSON.stringify(updatedSavedSearches));
  };

  return (
    <div className="space-y-3">
      {/* Main search bar */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="relative flex-grow">
          <SearchBox
            initialValue={localFilters.searchTerm}
            onSearch={handleSearchTermChange}
            placeholder="Rechercher un document..."
            className="w-full"
          />
        </div>

        {/* Filter button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <LucideFilter size={16} />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center p-0 rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-96 p-4 max-h-[80vh] overflow-auto bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl z-[9999]" 
            align="end"
            side="bottom"
            sideOffset={8}
            style={{ backgroundColor: 'white', backdropFilter: 'none' }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Filtres</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="h-8 text-xs"
                >
                  Réinitialiser
                </Button>
              </div>

              {/* Status filter */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Statut</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={localFilters.status.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleStatusChange(option.value, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`status-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Type de document</h4>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={localFilters.type.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleTypeChange(option.value, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`type-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date range filter */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Période</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label 
                      htmlFor="date-from"
                      className="text-xs"
                    >
                      De
                    </Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={localFilters.dateFrom || ''}
                      onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label 
                      htmlFor="date-to"
                      className="text-xs"
                    >
                      À
                    </Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={localFilters.dateTo || ''}
                      onChange={(e) => handleDateChange('dateTo', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Tags filter */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                    {availableTags.map((tag) => (
                      <div key={tag} className="flex items-center">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={localFilters.tags.includes(tag)}
                          onCheckedChange={(checked) =>
                            handleTagChange(tag, checked === true)
                          }
                          className="mr-1.5 h-3.5 w-3.5"
                        />
                        <Label 
                          htmlFor={`tag-${tag}`}
                          className="text-xs cursor-pointer"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save search option */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recherches sauvegardées</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsSaveSearchOpen(!isSaveSearchOpen)}
                    className="h-7 text-xs"
                  >
                    <LucideSave size={14} className="mr-1" />
                    Sauvegarder
                  </Button>
                </div>

                {isSaveSearchOpen && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      value={savedSearchName}
                      onChange={(e) => setSavedSearchName(e.target.value)}
                      placeholder="Nom de la recherche"
                      className="h-8 text-sm flex-grow"
                    />
                    <Button 
                      size="sm"
                      className="h-8" 
                      onClick={saveCurrentSearch}
                      disabled={!savedSearchName.trim()}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                )}

                {savedSearches.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {savedSearches.map((search) => (
                      <div 
                        key={search.id} 
                        className="flex items-center justify-between bg-muted/50 rounded-md p-1.5 text-sm"
                      >
                        <button
                          onClick={() => applySavedSearch(search)}
                          className="text-left hover:text-primary flex-grow"
                        >
                          {search.name}
                        </button>
                        <button
                          onClick={() => deleteSavedSearch(search.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <LucideX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-md mt-2">
          {localFilters.status.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              <span>Statut: {localFilters.status.length}</span>
              <button 
                onClick={() => setLocalFilters((prev) => ({ ...prev, status: [] }))}
                className="ml-1 hover:text-destructive"
              >
                <LucideX size={12} />
              </button>
            </Badge>
          )}
          
          {localFilters.type.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              <span>Type: {localFilters.type.length}</span>
              <button 
                onClick={() => setLocalFilters((prev) => ({ ...prev, type: [] }))}
                className="ml-1 hover:text-destructive"
              >
                <LucideX size={12} />
              </button>
            </Badge>
          )}
          
          {localFilters.tags.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              <span>Tags: {localFilters.tags.length}</span>
              <button 
                onClick={() => setLocalFilters((prev) => ({ ...prev, tags: [] }))}
                className="ml-1 hover:text-destructive"
              >
                <LucideX size={12} />
              </button>
            </Badge>
          )}
          
          {(localFilters.dateFrom || localFilters.dateTo) && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              <span>
                Date: {localFilters.dateFrom ? format(new Date(localFilters.dateFrom), 'dd/MM/yyyy', { locale: fr }) : '...'} 
                {' - '} 
                {localFilters.dateTo ? format(new Date(localFilters.dateTo), 'dd/MM/yyyy', { locale: fr }) : '...'}
              </span>
              <button 
                onClick={() => setLocalFilters((prev) => ({ ...prev, dateFrom: null, dateTo: null }))}
                className="ml-1 hover:text-destructive"
              >
                <LucideX size={12} />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="h-7 text-xs text-muted-foreground ml-auto"
          >
            Effacer tout
          </Button>
        </div>
      )}
    </div>
  );
} 