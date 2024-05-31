"use client";

import { ReactNode, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import ItemCard from "./item-card";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Filter, Plus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

type Item = {
  name: string;
  thumbnail: string;
};

type MultiSelectDialogProps = {
  addNewItems: (items: Item[]) => void;
  allItems: Item[];
  dialogTriggerNode?: ReactNode;
};

type MultiSelectProps = MultiSelectDialogProps & {
  selectedItems: Item[];
  removeItem: (item: Item) => void;
  label?: string;
};

export function MultiSelectDialog({
  addNewItems,
  allItems,
  dialogTriggerNode,
}: MultiSelectDialogProps) {
  const [filterText, setFilterText] = useState("");
  const [activeItems, setActiveItems] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
      <DialogTrigger asChild>
        {dialogTriggerNode ? (
          dialogTriggerNode
        ) : (
          <Button type="button" className="flex items-center gap-2">
            <Plus size={16} />
            Add New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <div className="flex h-[80vh] flex-col gap-6">
          <div className="relative px-1">
            <Input
              type="text"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
          <ScrollArea className="max-w-full flex-grow">
            {allItems
              .filter((i) => i.name.toLocaleLowerCase().includes(filterText))
              .map((item) => (
                <div key={item.name} className="mb-4">
                  <ItemCard
                    item={item}
                    showClose={false}
                    active={
                      activeItems.find(
                        (activeItem) => item.name === activeItem.name,
                      ) !== undefined
                    }
                    onClick={() => {
                      if (
                        activeItems.find(
                          (activeItem) => activeItem.name === item.name,
                        )
                      )
                        setActiveItems(
                          activeItems.filter(
                            (activeItem) => item.name !== activeItem.name,
                          ),
                        );
                      else setActiveItems([...activeItems, item]);
                    }}
                  />
                </div>
              ))}
          </ScrollArea>
          <div className="flex justify-end gap-4 px-1">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setActiveItems([]);
                setFilterText("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={activeItems.length === 0}
              onClick={() => {
                addNewItems(activeItems);
                setActiveItems([]);
                setFilterText("");
                setModalOpen(false);
              }}
            >
              Add {activeItems.length} Item
              {activeItems.length <= 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MultiSelect({
  label,
  dialogTriggerNode,
  removeItem,
  ...props
}: MultiSelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium leading-none">{label}</p>}
      {props.selectedItems.map((item) => (
        <ItemCard
          item={item}
          key={item.name}
          onClick={() => removeItem(item)}
        />
      ))}
      {dialogTriggerNode ? (
        <MultiSelectDialog {...props} />
      ) : (
        <Card className="h-24 w-full">
          <CardContent className="flex h-full items-center justify-center p-0">
            <MultiSelectDialog {...props} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
