"use client";

import { useDashboardStore } from "@/lib/store";
import type { WidgetConfig } from "@/lib/types/dashboard";
import * as React from "react";
import ReactGridLayout, {
	type Layout,
	type LayoutItem,
	verticalCompactor,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { WidgetCard } from "./widget-card";

interface DashboardGridProps {
	widgets: WidgetConfig[];
}

export function DashboardGrid({ widgets }: DashboardGridProps) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [containerWidth, setContainerWidth] = React.useState(1200);

	const isEditing = useDashboardStore(s => s.isEditing);
	const updateWidgetLayout = useDashboardStore(s => s.updateWidgetLayout);

	React.useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver(entries => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	const layout: LayoutItem[] = widgets.map(w => ({
		i: w.id,
		x: w.layout.x,
		y: w.layout.y,
		w: w.layout.w,
		h: w.layout.h,
		minW: w.layout.minW ?? 2,
		minH: w.layout.minH ?? 2,
		static: !isEditing,
	}));

	const handleLayoutChange = (newLayout: Layout) => {
		if (!isEditing) return;
		for (const item of newLayout) {
			updateWidgetLayout(item.i, {
				x: item.x,
				y: item.y,
				w: item.w,
				h: item.h,
				minW: item.minW,
				minH: item.minH,
			});
		}
	};

	return (
		<div ref={containerRef} className="min-h-[400px]">
			<ReactGridLayout
				className="layout"
				layout={layout}
				gridConfig={{ cols: 12, rowHeight: 60, margin: [16, 16] }}
				dragConfig={{ enabled: isEditing, handle: ".drag-handle" }}
				resizeConfig={{ enabled: isEditing }}
				width={containerWidth}
				onLayoutChange={handleLayoutChange}
				compactor={verticalCompactor}>
				{widgets.map(widget => (
					<div key={widget.id}>
						<WidgetCard widget={widget} />
					</div>
				))}
			</ReactGridLayout>
		</div>
	);
}
