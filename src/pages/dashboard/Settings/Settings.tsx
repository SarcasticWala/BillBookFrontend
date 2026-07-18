import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdPhotoCamera } from "react-icons/md";
import {
  useGetMeQuery,
  useUpdateProfileMutation,
} from "../../../features/auth/authApiSlice";
import { Card } from "../../../components/UI/Card";
import { Input } from "../../../components/UI/Input";
import { Textarea } from "../../../components/UI/Textarea";
import { Button } from "../../../components/UI/Button";
import { FormSection } from "../../../components/UI/FormSection";

interface ProfileForm {
  businessName: string;
  name: string;
  email: string;
  gstin: string;
  state: string;
  address: string;
}

type FormErrors = Partial<Record<keyof ProfileForm, string>>;

const EMPTY: ProfileForm = {
  businessName: "",
  name: "",
  email: "",
  gstin: "",
  state: "",
  address: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Standard 15-char GSTIN format.
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function validate(form: ProfileForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.businessName.trim()) {
    errors.businessName = "Business name is required";
  } else if (form.businessName.trim().length < 2) {
    errors.businessName = "Business name is too short";
  }
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (form.gstin.trim() && !GSTIN_RE.test(form.gstin.trim().toUpperCase())) {
    errors.gstin = "Enter a valid 15-character GSTIN";
  }
  return errors;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: meData, isLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const user = meData?.data;

  // Seed the form once the profile loads.
  useEffect(() => {
    if (user) {
      setForm({
        businessName: user.businessName || "",
        name: user.name || "",
        email: user.email || "",
        gstin: user.gstin || "",
        state: user.state || "",
        address: user.address || "",
      });
      setLogoPreview(user.logoUrl || "");
    }
  }, [user]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Image must be under 2MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const setField =
    (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // GSTIN is always upper-case.
      const value = key === "gstin" ? e.target.value.toUpperCase() : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear this field's error as the user corrects it.
      setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      // Send as multipart so the optional logo image can ride along.
      const fd = new FormData();
      (Object.keys(form) as (keyof ProfileForm)[]).forEach((key) =>
        fd.append(key, form[key].trim())
      );
      if (logoFile) fd.append("logo", logoFile);

      await updateProfile(fd).unwrap();
      toast.success("Profile updated successfully");
      // Profile saved — the sidebar refreshes via the Auth tag; go to dashboard.
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto secondary-font">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl primary-font text-gray-900">Settings</h1>
          <p className="text-sm light-font text-gray-500 mt-1">
            Manage your business profile
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="settings-form" loading={isSaving} disabled={isLoading}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          ))}
        </Card>
      ) : (
        <form id="settings-form" onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Business logo — click the avatar to upload */}
          <FormSection title="Business Logo" layout="plain">
            <div className="flex flex-col items-center text-center">
              <label className="relative cursor-pointer group" title="Upload logo">
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl primary-font text-gray-400">
                      {(form.businessName.charAt(0) || "B").toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <MdPhotoCamera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow ring-2 ring-white">
                  <MdPhotoCamera className="w-3.5 h-3.5" />
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              <p className="mt-3 text-sm secondary-font text-gray-700">
                {logoPreview ? "Change business logo" : "Add a business logo"}
              </p>
              <p className="text-xs light-font text-gray-400">
                PNG, JPG or WEBP · up to 2MB
              </p>
            </div>
          </FormSection>

          {/* Business details */}
          <FormSection title="Business Details">
            <Input
              label="Business Name"
              value={form.businessName}
              onChange={setField("businessName")}
              error={errors.businessName}
              placeholder="e.g. Acme Traders"
              required
              maxLength={100}
            />
            <Input
              label="Owner Name"
              value={form.name}
              onChange={setField("name")}
              placeholder="Your name"
              maxLength={100}
            />
            <Input
              label="Phone"
              value={user?.phone || ""}
              disabled
              containerClassName="opacity-90"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={setField("email")}
              error={errors.email}
              placeholder="you@business.com"
              maxLength={120}
            />
            <Input
              label="GSTIN"
              value={form.gstin}
              onChange={setField("gstin")}
              error={errors.gstin}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
            <Input
              label="State"
              value={form.state}
              onChange={setField("state")}
              placeholder="e.g. West Bengal"
              maxLength={60}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Business Address"
                value={form.address}
                onChange={setField("address")}
                rows={3}
                placeholder="Street, city, pincode"
                maxLength={300}
              />
            </div>
          </FormSection>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
