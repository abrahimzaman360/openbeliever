import { Flower2 } from "lucide-react";

export default function FavouritesView() {
  return (
    <div className="flex flex-col items-center justify-center mx-auto mt-10">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Flower2 className="size-10 sm:size-14" />
        <h1 className="font-bold text-lg">Bringing Life Soon!</h1>
        <p className="text-muted-foreground">
          This feature will be soon available!
        </p>
      </div>
    </div>
  );
}
