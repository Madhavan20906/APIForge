import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { KeyValue } from "@/lib/types";
import { uid } from "@/lib/utils-id";

interface Props {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({ items, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }: Props) {
  const update = (id: string, patch: Partial<KeyValue>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, { id: uid(), key: "", value: "", enabled: true }]);

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No entries. Click "Add" to create one.</p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox
            checked={item.enabled}
            onCheckedChange={(c) => update(item.id, { enabled: !!c })}
          />
          <Input
            placeholder={keyPlaceholder}
            value={item.key}
            onChange={(e) => update(item.id, { key: e.target.value })}
            className="font-mono text-sm"
          />
          <Input
            placeholder={valuePlaceholder}
            value={item.value}
            onChange={(e) => update(item.id, { value: e.target.value })}
            className="font-mono text-sm"
          />
          <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add
      </Button>
    </div>
  );
}
