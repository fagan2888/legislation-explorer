/*
OpenFisca -- A versatile microsimulation software
By: OpenFisca Team <contact@openfisca.fr>

Copyright (C) 2011, 2012, 2013, 2014, 2015 OpenFisca Team
https://github.com/openfisca

This file is part of OpenFisca.

OpenFisca is free software; you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

OpenFisca is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import {FormattedDate, FormattedMessage} from "react-intl";
import {IntlMixin} from "react-intl";
import moment from "moment";
import React, {PropTypes} from "react";

import AppPropTypes from "../../app-prop-types";
import Dropdown from "../dropdown";
import GitHubLink from "../github-link";
import List from "../list";


var ParameterPage = React.createClass({
  mixins: [IntlMixin],
  propTypes: {
    countryPackageGitHeadSha: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    parameter: AppPropTypes.parameterOrScale.isRequired,
    parametersUrlPath: PropTypes.string.isRequired,
  },
  findLastKnownInstant(brackets) {
    return brackets.reduce((memo, bracket) => {
      const rateLastInstant = bracket.rate[0].stop;
      const thresholdLastInstant = bracket.threshold[0].stop;
      var bracketLastInstant = rateLastInstant > thresholdLastInstant ? rateLastInstant : thresholdLastInstant;
      if (memo) {
        bracketLastInstant = memo > bracketLastInstant ? memo : bracketLastInstant;
      }
      return bracketLastInstant;
    }, null);
  },
  getDatedScale(brackets, instant) {
    const isBetween = item => item.start <= instant && item.stop >= instant;
    const datedScale = brackets.reduce((memo, bracket) => {
      const rate = bracket.rate.find(isBetween);
      const threshold = bracket.threshold.find(isBetween);
      if (rate && threshold) {
        memo.push({rate, threshold});
      }
      return memo;
    }, []);
    return datedScale.length ? datedScale : null;
  },
  getInitialState() {
    const datedScaleInstant = this.getTodayInstant();
    return {
      datedScaleInstant,
      datedScaleInstantText: this.formatDate(datedScaleInstant),
    };
  },
  getTodayInstant() {
    return new Date().toJSON().slice(0, 10);
  },
  handleDatedScaleInstantApply() {
    const {datedScaleInstantText} = this.state;
    const datedScaleInstant = moment(datedScaleInstantText, "DD/MM/YYYY").format("YYYY-MM-DD");
    this.setState({datedScaleInstant});
  },
  handleDatedScaleInstantSet(datedScaleInstant) {
    this.setState({
      datedScaleInstant,
      datedScaleInstantText: this.formatDate(datedScaleInstant),
    });
  },
  handleDatedScaleInstantSubmit(event) {
    event.preventDefault();
    this.handleDatedScaleInstantApply();
  },
  handleDatedScaleInstantTextChange(event) {
    const datedScaleInstantText = event.target.value;
    this.setState({datedScaleInstantText});
  },
  handleDatedScaleLastKnownInstantClick() {
    const {parameter} = this.props;
    const {brackets} = parameter;
    const lastKnownInstant = this.findLastKnownInstant(brackets);
    this.setState({
      datedScaleInstant: lastKnownInstant,
      datedScaleInstantText: this.formatDate(lastKnownInstant),
    });
  },
  handleDatedScaleTodayClick() {
    const datedScaleInstant = this.getTodayInstant();
    this.setState({
      datedScaleInstant,
      datedScaleInstantText: this.formatDate(datedScaleInstant),
    });
  },
  render() {
    var {countryPackageGitHeadSha, currency, parameter, parametersUrlPath} = this.props;
    var {brackets, description, end_line_number, format, start_line_number, unit, values} = parameter;
    var type = parameter["@type"];
    var fileName = parametersUrlPath.split("/").splice(-1);
    return (
      <div>
        <p>{description}</p>
        {
          <dl className="dl-horizontal">
            <dt>Type</dt>
            <dd>{type === "Parameter" ? "Paramètre" : "Barème"}</dd>
            {format && <dt>Format</dt>}
            {
              format && (
                <dd>
                  <samp>{format}</samp>
                </dd>
              )
            }
            {unit && <dt>{type === "Parameter" ? "Unité" : "Unité des seuils"}</dt>}
            {
              unit && (
                <dd>
                  <samp>{unit}</samp>
                  {unit === "currency" && ` - ${currency}`}
                </dd>
              )
            }
            <dt>Code source</dt>
            <dd>
              {
                end_line_number ?
                  `${fileName} ligne ${start_line_number} à ${end_line_number}` :
                  `${fileName} ligne ${start_line_number}`
                }
              <GitHubLink
                blobUrlPath={parametersUrlPath}
                commitReference={countryPackageGitHeadSha}
                endLineNumber={end_line_number}
                lineNumber={start_line_number}
                style={{marginLeft: "1em"}}
              >
                {children => <small>{children}</small>}
              </GitHubLink>
            </dd>
          </dl>
        }
        <hr style={{marginBottom: "3em", marginTop: "3em"}} />
        <div className="row">
          <div className="col-lg-8">
            {
              type === "Parameter" ?
                this.renderParameter(values) :
                this.renderScale(brackets)
            }
          </div>
        </div>
      </div>
    );
  },
  renderBracket(bracket, idx) {
    var {parameter} = this.props;
    var {brackets, format, unit} = parameter;
    return (
      <div>
        <dl className="dl-horizontal">
          <dt>{`Seuils tranche ${idx + 1}`}</dt>
          <dd style={{marginBottom: "1em"}}>
            {this.renderStartStopValues(bracket.threshold, format, unit)}
          </dd>
          <dt>{`Taux tranche ${idx + 1}`}</dt>
          <dd>
            {this.renderStartStopValues(bracket.rate, "rate")}
          </dd>
        </dl>
        {idx < brackets.length - 1 && <hr />}
      </div>
    );
  },
  renderDatedScale(datedScale) {
    var {countryPackageGitHeadSha, parameter, parametersUrlPath} = this.props;
    var {format, unit} = parameter;
    return (
      <div>
        <table className="table table-bordered table-hover table-striped">
          <thead>
            <tr>
              <th>Seuils</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>
            {
              datedScale.map((datedBracket, idx) => (
                <tr key={idx}>
                  <td className="clearfix">
                    {this.renderValue(datedBracket.threshold.value, format, unit)}
                    <GitHubLink
                      blobUrlPath={parametersUrlPath}
                      className="pull-right"
                      commitReference={countryPackageGitHeadSha}
                      endLineNumber={datedBracket.threshold.end_line_number}
                      lineNumber={datedBracket.threshold.start_line_number}
                      style={{color: "gray"}}
                      text={null}
                      title="Voir la valeur sur GitHub"
                    >
                      {children => <small>{children}</small>}
                    </GitHubLink>
                  </td>
                  <td className="clearfix">
                    {this.renderValue(datedBracket.rate.value, "rate")}
                    <GitHubLink
                      blobUrlPath={parametersUrlPath}
                      className="pull-right"
                      commitReference={countryPackageGitHeadSha}
                      endLineNumber={datedBracket.rate.end_line_number}
                      lineNumber={datedBracket.rate.start_line_number}
                      style={{color: "gray"}}
                      text={null}
                      title="Voir la valeur sur GitHub"
                    >
                      {children => <small>{children}</small>}
                    </GitHubLink>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  },
  renderFloatValue(value) {
    const decimalPartLength = 3;
    var [integerPart, decimalPart] = value.toFixed(decimalPartLength).toString().split(".");
    if (decimalPart === "0".repeat(decimalPartLength)) {
      decimalPart = null;
    }
    return (
      <span>
        <span style={{
          display: "inline-block",
          textAlign: "right",
          width: "5em",
        }}>
          {integerPart}
        </span>
        {decimalPart && "."}
        {decimalPart}
      </span>
    );
  },
  renderParameter(values) {
    var {parameter} = this.props;
    var {format, unit} = parameter;
    return (
      <div>
        <h4>Valeurs</h4>
        {this.renderStartStopValues(values, format, unit)}
      </div>
    );
  },
  renderScale(brackets) {
    const {datedScaleInstant, datedScaleInstantText} = this.state;
    const datedScale = this.getDatedScale(brackets, datedScaleInstant);
    return (
      <div>
        <h4 id="bareme" style={{marginBottom: "2em"}}>
          <form className="form-inline" onSubmit={this.handleDatedScaleInstantSubmit}>
            <FormattedMessage
              instant={
                <div className="input-group input-group-sm" style={{marginLeft: "0.3em"}}>
                  <input
                    className="form-control"
                    onBlur={this.handleDatedScaleInstantApply}
                    onChange={this.handleDatedScaleInstantTextChange}
                    placeholder="dd/mm/YYYY"
                    type="text"
                    value={datedScaleInstantText}
                  />
                  <Dropdown
                    className="input-group-btn"
                    items={[
                      {
                        onSelect: this.handleDatedScaleInstantApply,
                        text: "OK",
                        title: "Afficher un barême à la date demandée",
                      },
                      {
                        onSelect: this.handleDatedScaleTodayClick,
                        text: "Aujourd'hui",
                        title: "Afficher un barême à la date du jour",
                      },
                      {
                        onSelect: this.handleDatedScaleLastKnownInstantClick,
                        text: "Dernière date connue",
                        title: "Afficher un barême correspondant à la dernière date connue toutes tranches confondues",
                      },
                    ]}
                  />
                </div>
              }
              message="Barème au {instant}"
            />
          </form>
        </h4>
        {
          datedScale ?
            this.renderDatedScale(datedScale) : (
              <div className="alert alert-info" role="alert">
                <strong>Aucune tranche n'est définie à cette date.</strong>
                <p>Vous pouvez :</p>
                <ul>
                  <li>cliquer sur une date dans les tranches ci-dessous</li>
                  <li>ou trouver la dernière date connue en utilisant le menu déroulant ci-dessus</li>
                </ul>
              </div>
            )
        }
        <hr style={{marginBottom: "3em", marginTop: "3em"}} />
        <h4 style={{marginBottom: "2em"}}>Tranches</h4>
        <List items={brackets} type="unstyled">
          {this.renderBracket}
        </List>
      </div>
    );
  },
  renderStartStopValue(valueJson, format, unit, idx) {
    var {end_line_number, start, start_line_number, stop, value} = valueJson;
    var {countryPackageGitHeadSha, parametersUrlPath} = this.props;
    return (
      <tr key={idx}>
        <td>
          <FormattedMessage
            message="{start} - {stop}"
            start={
              <a
                href="#bareme"
                onClick={() => this.handleDatedScaleInstantSet(start)}
                title="Afficher le barème à cette date"
              >
                <FormattedDate format="short" value={start} />
              </a>
            }
            stop={
              <a
                href="#bareme"
                onClick={() => this.handleDatedScaleInstantSet(stop)}
                title="Afficher le barème à cette date"
              >
                <FormattedDate format="short" value={stop} />
              </a>
            }
          />
        </td>
        <td className="clearfix">
          {this.renderValue(value, format, unit)}
          <GitHubLink
            blobUrlPath={parametersUrlPath}
            className="pull-right"
            commitReference={countryPackageGitHeadSha}
            endLineNumber={end_line_number}
            lineNumber={start_line_number}
            style={{color: "gray"}}
            text={null}
            title="Voir la valeur sur GitHub"
          >
            {children => <small>{children}</small>}
          </GitHubLink>
        </td>
      </tr>
    );
  },
  renderStartStopValues(values, format, unit) {
    return (
      <table className="table table-bordered table-hover table-striped">
        <tbody>
          {values.map((value, idx) => this.renderStartStopValue(value, format, unit, idx))}
        </tbody>
      </table>
    );
  },
  renderValue(value, format, unit) {
    var {currency} = this.props;
    return (
      <span>
        <samp>
          {
            format === "rate" ? this.renderFloatValue(value * 100) :
            format !== "boolean" ? this.renderFloatValue(value) :
            value.toString()
          }
        </samp>
        {
          (format === "rate" || unit === "currency") && (
            <samp style={{marginLeft: "0.3em"}}>
              {format === "rate" ? "%" : currency}
            </samp>
          )
        }
      </span>
    );
  },
});


export default ParameterPage;
