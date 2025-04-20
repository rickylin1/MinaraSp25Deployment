import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, AlignLeft, Hash, Palette, Eye } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

enum CalendarColor {
  Color = 'color',
  Black = 'black',
  White = 'white'
}

enum VisibilityTypes {
  Invitees = 'invitees',
  Org_Members = 'org_members',
  Everyone = 'everyone'
}

interface CalendarFormProps {
  formData: {
    name?: string;
    tags?: string;
    description?: string;
    members?: string;
    colors?: CalendarColor;
    visibility?: VisibilityTypes;
  };
  setFormData: React.Dispatch<React.SetStateAction<CalendarFormProps["formData"]>>;
}

export function CalendarForm({ formData, setFormData }: CalendarFormProps) {
  const inputStyle =
    "w-full bg-[#FCF5E8] text-sm px-4 py-3 rounded-md placeholder:text-[#717075] placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4B2065]";

  const labelStyle = "flex items-center gap-2 text-sm font-medium text-black";

  return (
    <div className="space-y-6 text-sm">
      {/* Name */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <Users className="w-4 h-4" />
          What is your calendar’s name?
        </label>
        <Input
          type="text"
          placeholder="name your calendar"
          autoComplete="off"
          className={inputStyle}
          value={formData.name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <AlignLeft className="w-4 h-4" />
          what is your calendar about
        </label>
        <Input
          type="text"
          placeholder="write a description of your calendar"
          autoComplete="off"
          className={inputStyle}
          value={formData.tags || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <Hash className="w-4 h-4" />
          add tags
        </label>
        <Input
          type="text"
          placeholder="which filters can others use to find your org?"
          autoComplete="off"
          className={inputStyle}
          value={formData.description || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Members */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <Users className="w-4 h-4" />
          other members
        </label>
        <Input
          type="text"
          placeholder="invite others to your calendar"
          autoComplete="off"
          className={inputStyle}
          value={formData.members || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, members: e.target.value }))}
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <Palette className="w-4 h-4" />
          pick a base color for your calendar
        </label>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-black rounded border" />
          <select
            id="color-input"
            value={formData.colors || ""}
            onChange={(e) => setFormData((prev) => ({
              ...prev,
              colors: e.target.value as CalendarColor,
            }))}
            className="border border-[#4B2065] rounded-md px-3 py-2 text-sm"
          >
            <option value="" disabled>
              color
            </option>
            {Object.values(CalendarColor).map((color) => (
              <option key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <Eye className="w-4 h-4" />
          visibility
        </label>
        <div className="flex gap-2">
          {["invitees", "org_members", "everyone"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, visibility: val as VisibilityTypes }))}
              className={`px-4 py-2 rounded-md text-sm border font-medium ${
                formData.visibility === val
                  ? "bg-[#4B2065] text-white"
                  : "bg-white text-[#4B2065] border-[#4B2065]"
              }`}
            >
              {val.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}