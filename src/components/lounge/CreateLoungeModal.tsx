import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateLoungeModalProps {
  onCreateLounge: (name: string) => Promise<void>;
}

export const CreateLoungeModal: React.FC<CreateLoungeModalProps> = ({ onCreateLounge }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loungeName, setLoungeName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loungeName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateLounge(loungeName.trim());
      setLoungeName("");
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating lounge:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="warrior" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create New Lounge
        </Button>
      </DialogTrigger>
      <DialogContent className="warrior-glass border-warrior-gold/20">
        <DialogHeader>
          <DialogTitle className="text-warrior-gold">Create Private Lounge</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Start your own exclusive cigar lounge. Choose a name that reflects the atmosphere you want to create.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lounge-name" className="text-foreground">
              Lounge Name
            </Label>
            <Input
              id="lounge-name"
              value={loungeName}
              onChange={(e) => setLoungeName(e.target.value)}
              placeholder="The Smoke Ring, Warriors' Den, etc."
              className="bg-warrior-leather/20 border-warrior-gold/30"
              maxLength={50}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="warrior"
              disabled={isCreating || !loungeName.trim()}
            >
              {isCreating ? "Creating..." : "Create Lounge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};