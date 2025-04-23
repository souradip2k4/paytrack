export default function Overview() {
    return (
        <div className="legal__markdown mx-auto flex flex-col gap-2 px-4 py-16 lg:w-1/2 [&>ul]:flex [&>ul]:list-disc [&>ul]:flex-col [&>ul]:gap-2">
            <h1>Overview</h1>
            <iframe
                className="aspect-video w-full"
                src="https://player.vimeo.com/video/1077981992?autoplay=1&byline=0&controls=0&loop=1&portrait=0&title=0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                title="Filtering data in budgetbee"></iframe>
            <script src="https://player.vimeo.com/api/player.js"></script>
        </div>
    );
}
