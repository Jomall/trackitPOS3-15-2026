'use client'

import { useState, useEffect, useRef } from 'react';

interface Item {
  description: string;
  quantity: number;
  conditionNote: string;
}

export default function InventoryForm() {
  const [items, setItems] = useState<Item[]>([]);
  const itemId = useRef(0);

  useEffect(() => {
    // Listen for furnishingType change from parent
    const select = document.querySelector('[name="furnishingType"]') as HTMLSelectElement;
    const section = document.getElementById('inventory-section');
    const showSection = () => {
      if (section) {
        section.style.display = 'block';
        if (items.length === 0) {
          addItem();
        }
      }
    };
    const hideSection = () => {
      if (section) {
        section.style.display = 'none';
        setItems([]);
      }
    };

    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (target.value && target.value !== 'unfurnished') {
        showSection();
      } else {
        hideSection();
      }
    };

    if (select) {
      select.addEventListener('change', handleChange);
    }

    return () => {
      if (select) {
        select.removeEventListener('change', handleChange);
      }
    };
  }, []);

  const addItem = () => {
    const newId = itemId.current++;
    setItems([...items, { description: '', quantity: 1, conditionNote: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setItems(newItems);
  };

  // Populate formData on submit
  useEffect(() => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      items.forEach((item, index) => {
        const descInput = form.querySelector(`input[name="items[${index}][description]"]`) as HTMLInputElement;
        const qtyInput = form.querySelector(`input[name="items[${index}][quantity]"]`) as HTMLInputElement;
        const noteInput = form.querySelector(`input[name="items[${index}][conditionNote]"]`) as HTMLInputElement;
        if (descInput) descInput.value = item.description;
        if (qtyInput) qtyInput.value = item.quantity.toString();
        if (noteInput) noteInput.value = item.conditionNote || '';
      });
    }
  }, [items]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Household Items Inventory</h3>
      <div className="space-y-4 mb-4">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border">
            <input
              name={`items[${index}][description]`}
              placeholder="Item description (e.g., Sofa)"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <input
              name={`items[${index}][quantity]`}
              type="number"
              min="1"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <div className="flex items-end gap-2">
              <input
                name={`items[${index}][conditionNote]`}
                placeholder="Condition note (e.g., Good)"
                value={item.conditionNote || ''}
                onChange={(e) => updateItem(index, 'conditionNote', e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="bg-red-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors w-24"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="w-full bg-green-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-600 transition-all"
      >
        ➕ Add Item
      </button>
    </div>
  );
}
