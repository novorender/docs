import React, { MutableRefObject, useEffect, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CodeBlock from "@theme/CodeBlock";
import { Allotment } from "allotment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "../misc/spinner";

/** Icons */
import { faReceipt, faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";
/** Icons end */

/** Types */
import type { IEditorConfig } from "@site/demo-snippets/demo";
/** Types END */

interface Props {
	panesHeight: number;
	panesWidth: number;
	editorConfig: IEditorConfig;
	splitPaneDirectionVertical: boolean;
	canvasRef: MutableRefObject<HTMLCanvasElement>;
	canvas2DRef: MutableRefObject<HTMLCanvasElement>;
	previewCanvasRef: MutableRefObject<HTMLCanvasElement>;
	canvasWrapperRef: MutableRefObject<HTMLDivElement>;
	validationErrors: readonly Error[];
}

export default function Renderer({ canvasRef, canvas2DRef, previewCanvasRef, canvasWrapperRef, panesHeight, panesWidth, editorConfig, splitPaneDirectionVertical, validationErrors }: Props): JSX.Element {
	// const [canvasDimensions, setCanvasDimensions] = useState<{
	//   width: number;
	//   height: number;
	// }>({ width: 0, height: 0 });
	const [infoPaneContent, setInfoPaneContent] = useState<{
		content: string | object | any;
		title?: string;
	}>({ content: "" });
	const [previewCanvasWidth, setPreviewCanvasWidth] = useState<number>(0);
	const [isFullScreen, setIsFullScreen] = useState(false);

	useEffect(() => {
		// const resizeObserver = new ResizeObserver((entries) => {
		//   if (canvasRef.current) {
		//     for (const entry of entries) {
		//       setCanvasDimensions({
		//         width: entry.contentRect.width,
		//         height: entry.contentRect.height,
		//       });
		//     }
		//   }
		// });

		// resizeObserver.observe(canvasRef.current);

		window["openInfoPane"] = (content: object | string | any, title?: string) => {
			setInfoPaneContent({ content, title });
		};

		document.addEventListener("fullscreenchange", fullScreenEventListener, false);
		/**
		 * to prevent page scrolling when user actually tries to do the zoom in or out on canvas
		 * not sure if this can cause any interference with API's internal events.
		 */
		canvasRef.current.addEventListener("wheel", wheelEventListener, {
			passive: false,
		});

		return () => {
			document.removeEventListener("fullscreenchange", fullScreenEventListener, false);
			canvasRef?.current?.removeEventListener("wheel", wheelEventListener, false);
		};
	}, []);

	const fullScreenEventListener = () => setIsFullScreen(!!document.fullscreenElement);
	const wheelEventListener = (e: MouseEvent) => {
		if (!isFullScreen) {
			e.preventDefault();
		}
	};

	return (
		<BrowserOnly>
			{() => (
				<div ref={canvasWrapperRef} style={{ height: panesHeight, position: "relative" }} className="canvas-overscroll-fix">
					<Allotment vertical={!splitPaneDirectionVertical} onChange={(e: Array<number>) => setPreviewCanvasWidth(e[1])}>
						<Allotment.Pane>
							<RenderSpinner />
							<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas>
							{validationErrors?.length && <CustomErrorOverlay validationErrors={validationErrors} />}
							{editorConfig?.canvas2D && (
								<canvas
									ref={canvas2DRef}
									// width={canvasDimensions.width}
									// height={canvasDimensions.height}
									style={{
										pointerEvents: "none",
										width: "100%",
										height: "100%",
										position: "absolute",
										top: 0,
										left: 0,
									}}
								/>
							)}
						</Allotment.Pane>
						<Allotment.Pane visible={editorConfig.enablePreviewCanvas}>
							<RenderSpinner />
							<canvas ref={previewCanvasRef} width={splitPaneDirectionVertical ? previewCanvasWidth : panesWidth} height={!isFullScreen ? panesHeight : innerHeight} />
						</Allotment.Pane>
					</Allotment>
					<InfoBox content={infoPaneContent.content} title={infoPaneContent.title} />
				</div>
			)}
		</BrowserOnly>
	);
}

export function InfoBox({ content, title }: { content: object | string | any; title?: string }) {
	const [isCodeBlock, setIsCodeBlock] = useState(false);

	useEffect(() => {
		setIsCodeBlock(!!content);
	}, [content]);

	return (
		<div
			className="info-pane-container"
			style={{
				position: "absolute",
				bottom: isCodeBlock ? -20 : 0,
				left: 0,
				fontSize: 12,
				margin: 10,
				overflow: "auto",
				maxWidth: "25%",
			}}
		>
			{!isCodeBlock && (
				<button
					onClick={() => {
						setIsCodeBlock(true);
					}}
					title="Show info pane"
					className="button button--outline button--primary"
					style={{ padding: "0 5px", marginBottom: 2 }}
				>
					<FontAwesomeIcon icon={faReceipt} className={`fa-icon size-14 ${content ? "fa-bounce" : ""}`} />
				</button>
			)}
			{isCodeBlock && (
				<button
					onClick={() => {
						setIsCodeBlock(false);
					}}
					title="Hide info pane"
					className="button"
					style={{
						padding: "0px 5px",
						bottom: "-10px",
						zIndex: 99,
						position: "relative",
					}}
				>
					<FontAwesomeIcon icon={faCircleChevronDown} className="fa-icon size-14" />
				</button>
			)}
			{isCodeBlock && (
				<CodeBlock title={title} language="json">
					{(content && JSON.stringify(content, null, 2)) || "Nothing to see here..."}
				</CodeBlock>
			)}
		</div>
	);
}

export const RenderSpinner = () => (
	<Spinner
		wrapperStyles={{
			margin: "auto",
			position: "absolute",
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			zIndex: "-1",
		}}
	/>
);

const CustomErrorOverlay = ({ validationErrors }: { validationErrors: readonly Error[] }) => {
	function DisplayError({ error }: { error: Error }) {
		const errorMessage = error?.message || "No error message available";
		return (
			<>
				<p>
					<strong>Error Message:</strong> {errorMessage}
				</p>
			</>
		);
	}

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "absolute",
				top: 0,
				left: 0,
				inset: 0,
				fontSize: "large",
				padding: "2rem 2rem 4rem",
				lineHeight: 1.2,
				whiteSpace: "pre-wrap",
				overflow: "auto",
				backgroundColor: "rgba(0, 0, 0, 0.9)",
				color: "white",
			}}
		>
			<div
				style={{
					backgroundColor: "rgba(206, 17, 38, 0.1)",
					color: "rgb(252, 207, 207)",
					padding: "1rem 1rem 1.5rem",
				}}
			>
				<div
					style={{
						color: "rgb(232, 59, 70)",
						fontSize: "1.2em",
						marginBottom: "1rem",
						fontFamily: "sans-serif",
					}}
				>
					ERROR(S)
				</div>
				<div
					style={{
						lineHeight: 1.5,
						fontSize: "1rem",
						fontFamily: "Menlo, Consolas, monospace",
					}}
				>
					{validationErrors.map((e, i) => (
						<DisplayError key={i} error={e} />
					))}
				</div>
			</div>
		</div>
	);
};
