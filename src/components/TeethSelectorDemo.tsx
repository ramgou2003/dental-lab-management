import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TeethSelectorDemo() {
  const [selectedUpperTeeth, setSelectedUpperTeeth] = useState<string[]>([]);
  const [selectedLowerTeeth, setSelectedLowerTeeth] = useState<string[]>([]);
  const [currentArch, setCurrentArch] = useState<'upper' | 'lower'>('upper');

  const handleUpperToothSelect = (toothNumber: string) => {
    setSelectedUpperTeeth(prev => {
      if (prev.includes(toothNumber)) {
        return prev.filter(t => t !== toothNumber);
      } else {
        return [...prev, toothNumber];
      }
    });
  };

  const handleLowerToothSelect = (toothNumber: string) => {
    setSelectedLowerTeeth(prev => {
      if (prev.includes(toothNumber)) {
        return prev.filter(t => t !== toothNumber);
      } else {
        return [...prev, toothNumber];
      }
    });
  };

  const clearSelection = () => {
    if (currentArch === 'upper') {
      setSelectedUpperTeeth([]);
    } else {
      setSelectedLowerTeeth([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Teeth Selector Demo</CardTitle>
          <p className="text-sm text-gray-600">
            Click on teeth to select/deselect them. Uses FDI dental numbering system.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={currentArch === 'upper' ? 'default' : 'outline'}
              onClick={() => setCurrentArch('upper')}
            >
              Upper Arch
            </Button>
            <Button
              variant={currentArch === 'lower' ? 'default' : 'outline'}
              onClick={() => setCurrentArch('lower')}
            >
              Lower Arch
            </Button>
            <Button variant="outline" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">Teeth Diagram Removed</p>
                <p className="text-sm">The interactive teeth diagram has been removed as requested.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upper Arch Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Selected teeth: {selectedUpperTeeth.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedUpperTeeth.sort().map(tooth => (
                    <span
                      key={tooth}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      #{tooth}
                    </span>
                  ))}
                </div>
                {selectedUpperTeeth.length === 0 && (
                  <p className="text-gray-400 text-sm">No teeth selected</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lower Arch Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Selected teeth: {selectedLowerTeeth.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedLowerTeeth.sort().map(tooth => (
                    <span
                      key={tooth}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      #{tooth}
                    </span>
                  ))}
                </div>
                {selectedLowerTeeth.length === 0 && (
                  <p className="text-gray-400 text-sm">No teeth selected</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">FDI Dental Numbering System:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Upper Right:</strong> 18-11 (Molars to Central Incisor)
                <br />
                <strong>Upper Left:</strong> 21-28 (Central Incisor to Molars)
              </div>
              <div>
                <strong>Lower Right:</strong> 48-41 (Molars to Central Incisor)
                <br />
                <strong>Lower Left:</strong> 31-38 (Central Incisor to Molars)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
