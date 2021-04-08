import { useOutsideAlerter } from "@aha-app/aha-develop-react";
import { usePopper } from "https://cdn.skypack.dev/react-popper";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchPrStatus, prStatusCommit } from "../lib/github";
import { useGithubApi } from "../lib/useGithubApi";

/**
 * @param {import("../lib/github").StatusState} status
 */
const statusIcon = (status) => {
  switch (status) {
    case "ERROR":
      return "fa-regular fa-exclamation-triangle";
    case "EXPECTED":
      return "fa-regular fa-clock";
    case "FAILURE":
      return "fa-regular fa-times";
    case "PENDING":
      return "fa-regular fa-clock";
    case "SUCCESS":
      return "fa-regular fa-check";
  }
};

/**
 * @param {{status: import("../lib/github").StatusState}} param0
 */
const StatusIcon = ({ status }) => {
  return (
    <span className={`pr-check pr-check-${status.toLowerCase()}`}>
      <aha-icon icon={statusIcon(status)} />
    </span>
  );
};

const StatusCheck = ({ context }) => {
  return (
    <div className="pr-check-detail">
      <span className="pr-check-icon">
        <StatusIcon status={context.state} />
      </span>
      {context.avatarUrl?.length > 0 && (
        <img src={context.avatarUrl} className="pr-check-avatar" />
      )}
      <span>
        {context.targetUrl?.length > 0 ? (
          <a href={context.targetUrl} target="_blank">
            {context.context}
          </a>
        ) : (
          context.context
        )}
      </span>
    </div>
  );
};

/**
 *
 * @param {{prStatus: import("../lib/github").CommitStatus; showCount?: boolean}} param0
 * @returns
 */
function Status({ prStatus, showCount }) {
  const [referenceElement, setReferenceElement] = useState(null);
  const popperElement = useRef(null);
  const { styles, attributes } = usePopper(
    referenceElement,
    popperElement.current,
    {
      modifiers: [],
    }
  );
  const [showChecks, setShowChecks] = useState(false);
  const [allowToggle, setAllowToggle] = useState(true);
  console.log("comp", allowToggle);

  const toggleShowChecks = () => {
    console.log("call", allowToggle);
    if (allowToggle) setShowChecks((v) => !v);
  };
  useOutsideAlerter(popperElement, () => {
    if (showChecks) {
      setAllowToggle(false);
      setShowChecks(false);
    }
  });
  useEffect(() => {
    if (!allowToggle) setAllowToggle(true);
  }, [allowToggle]);

  if (!prStatus.statusCheckRollup) {
    return null;
  }

  const contexts = prStatus?.status?.contexts || [];

  const checks = contexts.map((context, idx) => {
    return <StatusCheck key={idx} context={context} />;
  });

  const count = showCount !== false && (
    <span className="pr-count">
      <span>{contexts.filter((v) => v.state === "SUCCESS").length}</span>
      <span>{"/"}</span>
      <span>{contexts.length}</span>
    </span>
  );

  return (
    <>
      <span
        className={`pr-status pr-status-${prStatus.statusCheckRollup.state.toLowerCase()}`}
        ref={setReferenceElement}
        onClick={toggleShowChecks}
      >
        <StatusIcon status={prStatus.statusCheckRollup.state} />
        {count}
      </span>
      <aha-tooltip type="popover">
        <span slot="trigger">Foo</span>
        {checks}
      </aha-tooltip>

      <span
        style={styles.popper}
        ref={popperElement}
        className={`pr-checks ${showChecks ? "" : "hidden"}`}
        {...attributes.popper}
      >
        {checks}
      </span>
    </>
  );
}

/**
 * @param {{pr:import("../lib/fields").PrLink; showCount: boolean?}} param0
 */
function FetchStatus({ pr, showCount }) {
  const { data: prStatus, error, authed, loading, fetchData } = useGithubApi(
    async (api) => {
      if (pr.commits) return prStatusCommit(pr);
      return await fetchPrStatus(api, pr);
    }
  );

  if (error) {
    return (
      <span className="pr-status">
        <aha-icon icon="fa-regular fa-warn"></aha-icon>
      </span>
    );
  }

  if (loading) {
    return (
      <span className="pr-status">
        <aha-spinner />
      </span>
    );
  }

  if (!authed || !prStatus) {
    return (
      <span className="pr-status">
        <aha-button onClick={fetchData}>
          <aha-icon icon="fa-regular fa-refresh"></aha-icon>
        </aha-button>
      </span>
    );
  }

  return <Status prStatus={prStatus} showCount={showCount} />;
}

export { FetchStatus, Status };
