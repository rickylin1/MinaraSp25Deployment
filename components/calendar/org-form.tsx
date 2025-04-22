import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Users, MapPin, AlignLeft, Hash, Globe, Palette, Eye } from "lucide-react";
import { VisibilityTypes } from "@/components/calendar/calendar-form";
import { getColorName } from "./views/color-picker";


interface OrgFormProps {
  formData: {
    name?: string;
    location?: string;
    description?: string;
    tags?: string;
    links?: string;
    members?: string;
    colors?: string;
    visibility?: VisibilityTypes;
    audience?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<OrgFormProps["formData"]>>;
}

export function OrgForm({ formData, setFormData }: OrgFormProps) {
  const inputStyle =
    "w-full bg-[#FCF5E8] border border-[#F4C787] text-sm px-4 py-3 rounded-md placeholder:text-[#717075] placeholder:font-medium";
  const labelStyle = "flex items-center gap-2 text-sm font-medium text-[#2F2E2C]";

  return (
    <div className="space-y-4 text-sm">
      {/* Name */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <Users className="w-4 h-4" />
          What is your organization’s name?
        </label>
        <Input
          type="text"
          placeholder="name your organization"
          value={formData.name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full bg-[#FCF5E8] border border-[#F4C787] text-sm px-4 py-3 rounded-md text-[#717075] font-medium"
        />
      </div>

      {/* Location */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <MapPin className="w-4 h-4" />
          location
        </label>
        <Input
          className={inputStyle}
          placeholder="add physical location or skip"
          value={formData.location}
          onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <AlignLeft className="w-4 h-4" />
          write a description of your organization
        </label>
        <Textarea
          className={inputStyle}
          placeholder="write a description of the event"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <Hash className="w-4 h-4" />
          add tags
        </label>
        <Input
          className={inputStyle}
          placeholder="which filters can others use to find your org?"
          value={formData.tags}
          onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
        />
      </div>

      {/* Links */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <Globe className="w-4 h-4" />
          do you have any related links?
        </label>
        <Input
          className={inputStyle}
          placeholder="instagram, website, email, etc."
          value={formData.links}
          onChange={(e) => setFormData((p) => ({ ...p, links: e.target.value }))}
        />
      </div>

      {/* Members */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <Users className="w-4 h-4" />
          other members
        </label>
        <Input
          className={inputStyle}
          placeholder="what are the emails of others in your org?"
          value={formData.members}
          onChange={(e) => setFormData((p) => ({ ...p, members: e.target.value }))}
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className={labelStyle}>
          <Palette className="w-4 h-4" />
          pick a base color for your calendar
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            id="color-input"
            value={formData.colors || "#000000"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                colors: e.target.value,
              }))
            }
            className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
          />
          <span className="text-sm">
            {getColorName(formData.colors || "#000000")}
          </span>
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <Eye className="w-4 h-4" />
          visibility
        </label>
        <div className="flex gap-2">
          {["only invitees", "org members", "everyone"].map((v) => (
            <Button
              key={v}
              variant={formData.visibility === v ? "default" : "outline"}
              onClick={() => setFormData((p) => ({ ...p, visibility: v as VisibilityTypes}))}
              className={`text-xs px-4 py-2 rounded-lg border-2 ${formData.visibility === v
                ? "bg-[#4B2065] text-white"
                : "bg-white text-[#4B2065] border-[#4B2065]"
                }`}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div className="space-y-1">
        <label className={labelStyle}>
          <Users className="w-4 h-4" />
          who is this for?
        </label>
        <Select onValueChange={(value) => setFormData((p) => ({ ...p, audience: value }))}>
          <SelectTrigger className={inputStyle}>
            <SelectValue placeholder="undergrads, grad students, faculty, everyone, etc." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undergrads">Undergrads</SelectItem>
            <SelectItem value="grad students">Grad Students</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="everyone">Everyone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* <div className="pt-4 flex justify-end">
        <Button className="bg-orange-400 hover:bg-orange-500">create organization</Button>
      </div> */}
    </div>
  );
}
