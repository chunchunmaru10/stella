import { InputWithLabel } from "./ui/input";
import { Dispatch, SetStateAction } from "react";
import ItemCard from "./item-card";

export default function ThumbnailInput({
  thumbnailText,
  thumbnailUrl,
  setThumbnailUrl,
}: {
  thumbnailText: string;
  thumbnailUrl: string;
  setThumbnailUrl: Dispatch<SetStateAction<string>>;
}) {
  return (
    <>
      {thumbnailUrl ? (
        <div className="grid w-full max-w-full items-center gap-1.5">
          <p className="text-sm font-medium leading-none">Thumbnail</p>
          <div>
            <ItemCard
              item={{
                name: thumbnailText,
                thumbnail: thumbnailUrl,
              }}
              onClick={() => {
                setThumbnailUrl("");
              }}
            />
          </div>
        </div>
      ) : (
        <InputWithLabel
          label="Thumbnail URL"
          type="text"
          id="thumbnail url"
          onChange={async (e) => {
            if (!URL.canParse(e.target.value)) return;
            setThumbnailUrl(e.target.value);
          }}
        />
      )}
    </>
  );
}
