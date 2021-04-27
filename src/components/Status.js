import React from "react";
import { getPrByUrl, prStatusCommit } from "../lib/github";
import { useGithubApi } from "../lib/useGithubApi";
import { usePopperAlerter } from "../lib/usePopperAlerter";
import GithubLink from "./GithubLink";

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
      return "fa-regular fa-times-circle";
    case "PENDING":
      return "fa-regular fa-clock";
    case "SUCCESS":
      return "fa-regular fa-check-circle";
  }
};

/**
 * @type {React.FC<{status: import("../lib/github").StatusState}>}
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
    <aha-flex className="pr-check-detail" gap="5px">
      <span className="pr-check-icon">
        <StatusIcon status={context.state} />
      </span>
      {context.avatarUrl?.length > 0 && (
        <div className="pr-check-avatar">
          <img src={context.avatarUrl} />
        </div>
      )}
      <span>
        {context.targetUrl?.length > 0 ? (
          <GithubLink href={context.targetUrl}>{context.context}</GithubLink>
        ) : (
          context.context
        )}
      </span>
    </aha-flex>
  );
};

/**
 * @type {React.FC<{prStatus: import("../lib/github").CommitStatus}>}
 */
const Status = ({ prStatus }) => {
  const {
    attributes,
    popperElement,
    setReferenceElement,
    styles,
    toggle,
    visible,
  } = usePopperAlerter({ modifiers: [] });

  if (!prStatus.statusCheckRollup) {
    return null;
  }

  const contexts = prStatus?.status?.contexts || [];

  const checks = contexts.map((context, idx) => {
    return <StatusCheck key={idx} context={context} />;
  });

  const count = (
    <span className="pr-count">
      {contexts.filter((v) => v.state === "SUCCESS").length}
      {"/"}
      {contexts.length} passed
    </span>
  );

  return (
    <span>
      <span
        className={`pr-status pr-status-${prStatus.statusCheckRollup.state.toLowerCase()}`}
        ref={setReferenceElement}
        onClick={() => toggle()}
      >
        <StatusIcon status={prStatus.statusCheckRollup.state} />
      </span>

      <span
        style={styles.popper}
        ref={popperElement}
        className={`pr-checks ${visible ? "" : "hidden"}`}
        {...attributes.popper}
      >
        <aha-flex direction="column" gap="4px">
          <aha-flex justifyContent="space-between" alignItems="baseline">
            <h5>Checks</h5>
            {count}
          </aha-flex>

          {checks}
        </aha-flex>
      </span>
    </span>
  );
};

/**
 * @type {React.FC<{pr:import("../lib/github").PrForLinkWithStatus}>}
 */
const FetchStatus = ({ pr }) => {
  const { data: fetchedPr, error, authed, loading, fetchData } = useGithubApi(
    async (api) => {
      if (pr.commits) return pr;
      return await getPrByUrl(api, pr.url, { includeStatus: true });
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

  if (!authed || !fetchedPr) {
    return (
      <span className="pr-status">
        <aha-button onClick={fetchData}>
          <aha-icon icon="fa-regular fa-refresh"></aha-icon>
        </aha-button>
      </span>
    );
  }

  const prStatus = prStatusCommit(fetchedPr);
  return <Status prStatus={prStatus} />;
};

export { FetchStatus, Status };
