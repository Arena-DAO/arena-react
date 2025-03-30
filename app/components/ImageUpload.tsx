"use client";

import { Input, type InputProps } from "@heroui/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { FieldError, FieldValues } from "react-hook-form";
import { useEnv } from "~/hooks/useEnv";

export type ImageUploaderRef = {
	uploadToS3: () => Promise<string | null>;
};

interface ImageUploaderProps extends Omit<InputProps, "type"> {
	field: FieldValues;
	error?: FieldError;
}

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
	({ field, error, ...props }, ref) => {
		const env = useEnv();
		const [uploading, setUploading] = useState(false);
		const [selectedFile, setSelectedFile] = useState<File | null>(null);
		const [sizeError, setSizeError] = useState<string | null>(null);

		useEffect(() => {
			if (!field.value) {
				setSelectedFile(null);
				setSizeError(null);
			}
		}, [field.value]);

		const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			if (file.size > 5 * 1024 * 1024) {
				setSizeError("Image exceeds 5MB limit");
				e.target.value = "";
				return;
			}

			setSizeError(null);
			setSelectedFile(file);
			field.onChange(URL.createObjectURL(file));
		};

		const uploadToS3 = async (): Promise<string | null> => {
			if (!selectedFile) return field.value;

			try {
				setUploading(true);

				const presignedResponse = await fetch(`${env.API_URL}/image`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});

				if (!presignedResponse.ok) {
					throw new Error("Failed to get upload URL");
				}

				const { postData, imageUrl } = await presignedResponse.json();
				const formData = new FormData();

				for (const [key, value] of Object.entries(postData.fields)) {
					formData.append(key, value as string);
				}

				formData.append("Content-Type", selectedFile.type);
				formData.append("file", selectedFile);

				const uploadResponse = await fetch(postData.url, {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					throw new Error("Failed to upload image");
				}

				return imageUrl;
			} catch (err) {
				console.error("Upload error:", err);
				return null;
			} finally {
				setUploading(false);
			}
		};

		useImperativeHandle(ref, () => ({ uploadToS3 }));

		return (
			<Input
				type="file"
				accept="image/*"
				onChange={handleImageChange}
				disabled={uploading || props.disabled}
				errorMessage={sizeError || error?.message}
				isInvalid={!!sizeError || !!error}
				{...props}
			/>
		);
	},
);

export default ImageUploader;
